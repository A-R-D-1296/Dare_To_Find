#!/usr/bin/env python3
"""
==============================================================================
LexisCo — Phase 1: Legal Document Ingestion Pipeline
==============================================================================

Converts raw legal documents (.txt, .pdf) into structured, metadata-rich
chunks ready for semantic search (RAG pipeline).

Designed for Indian legal corpus: IPC, BNS, RTI Act, Consumer Protection Act,
CrPC, CPC, IT Act, and more.

Usage:
    python backend/scripts/ingest_data.py
    python backend/scripts/ingest_data.py --data-dir ./custom/path
    python backend/scripts/ingest_data.py --chunk-size 1200 --overlap 150

Output:
    backend/data/processed_chunks.json

Author:  LexisCo Team
Version: 1.0.0
==============================================================================
"""

import argparse
import json
import logging
import os
import re
import sys
import unicodedata
from pathlib import Path
from typing import Dict, Generator, List, Optional, Tuple

# ---------------------------------------------------------------------------
# Logging setup
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("lexisco.ingest")


# ===========================================================================
# CONSTANTS & CONFIGURATION
# ===========================================================================

# Default chunking parameters (characters)
DEFAULT_CHUNK_SIZE = 1000
DEFAULT_OVERLAP = 120

# Supported file extensions
SUPPORTED_EXTENSIONS = {".txt", ".pdf"}

# ---------------------------------------------------------------------------
# Section-detection regex — covers common Indian legal citation formats:
#   Section 420, Sec. 420, SECTION 420, S. 420, §420, 420.
# ---------------------------------------------------------------------------
SECTION_PATTERN = re.compile(
    r"(?:Section|Sec\.?|S\.?|§)\s*(\d+[A-Za-z]*)|\b(\d+[A-Za-z]*)\.\s",
    re.IGNORECASE,
)

# Pattern used to split text at section boundaries
SECTION_SPLIT_PATTERN = re.compile(
    r"(?=\n\s*(?:Section|Sec\.?|S\.?|§)\s+\d+|\n\s*\d+\.\s)",
    re.IGNORECASE,
)

# ---------------------------------------------------------------------------
# Law-type classification map
# Keys are lowercased substrings that may appear in filenames or act names.
# ---------------------------------------------------------------------------
LAW_TYPE_MAP = {
    # Criminal
    "ipc": "criminal",
    "indian penal code": "criminal",
    "bns": "criminal",
    "bharatiya nyaya sanhita": "criminal",
    "crpc": "criminal",
    "cr.p.c": "criminal",
    "bnss": "criminal",
    "bharatiya nagarik suraksha sanhita": "criminal",
    "ndps": "criminal",
    "narcotic": "criminal",
    "pocso": "criminal",
    "arms act": "criminal",

    # Consumer
    "consumer": "consumer",
    "consumer protection": "consumer",
    "copra": "consumer",

    # Civil
    "cpc": "civil",
    "civil procedure": "civil",
    "contract act": "civil",
    "indian contract": "civil",
    "specific relief": "civil",
    "limitation act": "civil",
    "transfer of property": "civil",
    "registration act": "civil",

    # Constitutional / Administrative
    "rti": "constitutional",
    "right to information": "constitutional",
    "constitution": "constitutional",

    # IT / Cyber
    "it act": "cyber",
    "information technology": "cyber",
    "cyber": "cyber",

    # Labour
    "labour": "labour",
    "factories act": "labour",
    "industrial disputes": "labour",
    "minimum wages": "labour",

    # Family
    "hindu marriage": "family",
    "divorce": "family",
    "guardianship": "family",
    "adoption": "family",
    "maintenance": "family",
    "domestic violence": "family",
}

# Hindi character range for basic language detection
HINDI_RANGE = re.compile(r"[\u0900-\u097F]")


# ===========================================================================
# FILE LOADING
# ===========================================================================

def load_files(data_dir: str) -> Generator[Tuple[Path, str], None, None]:
    """
    Discover all supported files under *data_dir*.

    Yields:
        (file_path, extension) tuples for each supported file.
    """
    data_path = Path(data_dir)
    if not data_path.exists():
        logger.error("Data directory does not exist: %s", data_dir)
        sys.exit(1)

    found = 0
    for fpath in sorted(data_path.rglob("*")):
        if fpath.is_file() and fpath.suffix.lower() in SUPPORTED_EXTENSIONS:
            found += 1
            yield fpath, fpath.suffix.lower()

    if found == 0:
        logger.warning(
            "No supported files (.txt, .pdf) found in %s", data_dir
        )


# ===========================================================================
# TEXT EXTRACTION
# ===========================================================================

def extract_text_from_txt(filepath: Path) -> str:
    """Read plain-text file with encoding fallback."""
    for encoding in ("utf-8", "utf-8-sig", "latin-1", "cp1252"):
        try:
            return filepath.read_text(encoding=encoding)
        except (UnicodeDecodeError, ValueError):
            continue
    logger.error("Could not decode %s with any known encoding.", filepath)
    return ""


def extract_text_from_pdf(filepath: Path) -> str:
    """
    Extract text from a PDF using pdfplumber.
    Falls back to PyPDF2 if pdfplumber is unavailable.
    """
    # Try pdfplumber first (better table/layout handling)
    try:
        import pdfplumber  # type: ignore

        pages: List[str] = []
        with pdfplumber.open(filepath) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text:
                    pages.append(text)
                else:
                    logger.debug("Page %d of %s yielded no text.", i + 1, filepath.name)
        return "\n\n".join(pages)

    except ImportError:
        logger.info("pdfplumber not installed — falling back to PyPDF2.")

    # Fallback: PyPDF2
    try:
        from PyPDF2 import PdfReader  # type: ignore

        reader = PdfReader(str(filepath))
        pages = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                pages.append(text)
        return "\n\n".join(pages)

    except ImportError:
        logger.error(
            "Neither pdfplumber nor PyPDF2 is installed. "
            "Install one of them:  pip install pdfplumber"
        )
        return ""

    except Exception as exc:
        logger.error("Failed to read PDF %s: %s", filepath.name, exc)
        return ""


def extract_text(filepath: Path, ext: str) -> str:
    """Dispatch to the appropriate text extractor."""
    if ext == ".txt":
        return extract_text_from_txt(filepath)
    elif ext == ".pdf":
        return extract_text_from_pdf(filepath)
    else:
        logger.warning("Unsupported extension: %s", ext)
        return ""


# ===========================================================================
# TEXT CLEANING
# ===========================================================================

def clean_text(raw: str) -> str:
    """
    Clean raw legal text while preserving structure.

    Steps:
        1. Normalize Unicode (NFC form)
        2. Replace non-breaking spaces and form feeds
        3. Collapse runs of blank lines to a single blank line
        4. Strip trailing whitespace per line
        5. Normalize horizontal whitespace (but keep single newlines)
    """
    if not raw:
        return ""

    text = unicodedata.normalize("NFC", raw)

    # Replace special whitespace characters
    text = text.replace("\xa0", " ")  # non-breaking space
    text = text.replace("\f", "\n")   # form feed (page break)
    text = text.replace("\r\n", "\n") # normalize line endings
    text = text.replace("\r", "\n")

    # Collapse 2+ consecutive newlines → 1
    text = re.sub(r"\n{2,}", "\n", text)

    # Strip trailing whitespace on each line
    text = re.sub(r"[ \t]+$", "", text, flags=re.MULTILINE)

    # Collapse multiple spaces/tabs within a line → single space
    text = re.sub(r"[ \t]{2,}", " ", text)

    return text.strip()


# ===========================================================================
# SECTION-AWARE SPLITTING
# ===========================================================================

def split_into_sections(text: str) -> List[str]:
    """
    Split text at legal section boundaries.

    Returns a list of section-level text blocks.  If no section headers
    are detected, the entire text is returned as one block.
    """
    parts = SECTION_SPLIT_PATTERN.split(text)
    # Filter out empty/whitespace-only parts
    sections = [p.strip() for p in parts if p.strip()]
    return sections if sections else [text]


# ===========================================================================
# CHUNKING
# ===========================================================================

def _sliding_window_chunks(
    text: str,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    overlap: int = DEFAULT_OVERLAP,
) -> List[str]:
    """
    Basic sliding-window chunker with overlap.
    Tries to break at paragraph or sentence boundaries for cleaner chunks.
    """
    chunks: List[str] = []
    start = 0
    length = len(text)

    while start < length:
        end = min(start + chunk_size, length)

        # If we're not at the very end, try to find a clean break point
        if end < length:
            # Preference order: paragraph break > sentence end > space
            # Look backward from `end` for a good split point
            search_region = text[start:end]

            # 1. Paragraph break (newline)
            para_break = search_region.rfind("\n")
            if para_break != -1 and para_break > chunk_size * 0.3:
                end = start + para_break + 1  # include the first \n

            # 2. Sentence boundary (period followed by space or newline)
            elif (sent_match := re.search(r"\.\s", search_region[::-1])):
                pos = len(search_region) - sent_match.start()
                if pos > chunk_size * 0.3:
                    end = start + pos

            # 3. Any whitespace
            else:
                space_pos = search_region.rfind(" ")
                if space_pos != -1 and space_pos > chunk_size * 0.3:
                    end = start + space_pos

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        # Advance with overlap
        start = max(end - overlap, start + 1)

    return chunks


def chunk_text(
    text: str,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    overlap: int = DEFAULT_OVERLAP,
) -> List[str]:
    """
    Hybrid chunking strategy:

    1. First, split text at section boundaries (Section X, Sec. X, etc.)
    2. If a section fits within chunk_size, keep it as one chunk.
    3. If a section is too large, apply sliding-window fallback.
    4. If no sections detected, fall back entirely to sliding-window.

    This ensures legal sections stay intact when possible, while still
    handling large or unstructured documents gracefully.
    """
    if not text:
        return []

    sections = split_into_sections(text)
    chunks: List[str] = []

    for section in sections:
        if len(section) <= chunk_size:
            # Section fits in one chunk — keep it intact
            chunks.append(section)
        else:
            # Section is too large — apply sliding window
            sub_chunks = _sliding_window_chunks(section, chunk_size, overlap)
            chunks.extend(sub_chunks)

    return chunks


# ===========================================================================
# METADATA EXTRACTION
# ===========================================================================

def _derive_act_name(filepath: Path) -> str:
    """
    Derive a human-readable act name from the filename.
    Normalizes specific acts (IPC, BNS).
    """
    stem = filepath.stem  # filename without extension
    name = re.sub(r"[_\-]+", " ", stem)
    lower_name = name.lower()

    if "ipc" in lower_name or "indian penal" in lower_name:
        return "Indian Penal Code"
    if "bns" in lower_name or "bharatiya nyaya" in lower_name:
        return "Bharatiya Nyaya Sanhita"

    acronyms = {"crpc", "cpc", "rti", "bnss", "ndps", "pocso", "it"}
    words = name.split()
    result = []
    for w in words:
        if w.lower() in acronyms:
            result.append(w.upper())
        else:
            result.append(w.capitalize())

    return " ".join(result)


def _detect_section_and_title(text: str) -> Tuple[str, str]:
    """
    Extract the first section number found in a chunk, along with its title.
    Title is assumed to be the immediate text/line following the section header.
    Returns ("unknown", "unknown") if none detected.
    """
    match = SECTION_PATTERN.search(text)
    if not match:
        return "unknown", "unknown"

    sec_num = "unknown"
    for group in match.groups():
        if group:
            sec_num = group.strip()
            break

    # Extract title
    rest_of_text = text[match.end():].lstrip(" \t.-")
    first_newline = rest_of_text.find("\n")
    if first_newline != -1:
        title = rest_of_text[:first_newline].strip(" .-*")
    else:
        title = rest_of_text.strip(" .-*")
        if len(title) > 150:
            title = title[:150] + "..."

    return sec_num, title if title else "unknown"


def _detect_source(text: str, act_name: str) -> str:
    """
    Detect the specific source of a chunk if mentioned (e.g. 'Section 2 of BNS').
    Otherwise fallback to the normalized act name.
    """
    match = re.search(r"(?:Section|Sec\.?|S\.?|§)\s*\d+[A-Za-z]*\s+(?:of|under|in)\s+([A-Za-z]+)", text, re.IGNORECASE)
    if match:
        explicit_src = match.group(1).lower()
        if explicit_src in {"bns", "ipc", "crpc", "cpc", "rti", "bnss", "ndps"}:
            return explicit_src

    # Fallback to general act mapping
    if act_name == "Indian Penal Code":
        return "ipc"
    if act_name == "Bharatiya Nyaya Sanhita":
        return "bns"
    return act_name.lower().replace(" ", "_").replace(".", "")


def _classify_law_type(act_name: str) -> str:
    """
    Classify the law type based on the act name.
    Falls back to "other" if no match is found.
    """
    name_lower = act_name.lower()
    for keyword, law_type in LAW_TYPE_MAP.items():
        if keyword in name_lower:
            return law_type
    return "other"


def _detect_language(text: str) -> str:
    """
    Basic language detection:
    - If >15% of characters are Devanagari → "hi" (Hindi)
    - Otherwise → "en" (English)
    """
    if not text:
        return "en"

    # Count Hindi (Devanagari) characters
    hindi_chars = len(HINDI_RANGE.findall(text))
    # Count all alphabetic characters (any script)
    alpha_chars = sum(1 for c in text if c.isalpha())

    if alpha_chars == 0:
        return "en"

    hindi_ratio = hindi_chars / alpha_chars
    return "hi" if hindi_ratio > 0.15 else "en"


def extract_metadata(
    chunk_text: str,
    filepath: Path,
    act_name: str,
    law_type: str,
) -> Dict[str, str]:
    """
    Build the metadata dict for a single chunk.
    """
    sec_num, title = _detect_section_and_title(chunk_text)
    return {
        "act_name": act_name,
        "section": sec_num,
        "title": title,
        "law_type": law_type,
        "language": _detect_language(chunk_text),
        "source_file": filepath.name,
    }


# ===========================================================================
# DOCUMENT PROCESSING PIPELINE
# ===========================================================================

def process_document(
    filepath: Path,
    ext: str,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    overlap: int = DEFAULT_OVERLAP,
) -> List[Dict]:
    """
    End-to-end processing of a single legal document:

    1. Extract raw text
    2. Clean and normalize
    3. Chunk with section-awareness
    4. Attach metadata to each chunk

    Returns a list of chunk dicts ready for JSON serialization.
    """
    logger.info("Processing: %s", filepath.name)

    # Step 1: Extract
    raw_text = extract_text(filepath, ext)
    if not raw_text or not raw_text.strip():
        logger.warning("  ⚠ Empty or unreadable file — skipping: %s", filepath.name)
        return []

    # Step 2: Clean
    cleaned = clean_text(raw_text)
    logger.info("  ✓ Extracted %d chars (cleaned)", len(cleaned))

    # Step 3: Derive file-level metadata (shared across all chunks)
    act_name = _derive_act_name(filepath)
    law_type = _classify_law_type(act_name)

    # Step 4: Chunk
    chunks = chunk_text(cleaned, chunk_size, overlap)
    logger.info("  ✓ Created %d chunks (size=%d, overlap=%d)", len(chunks), chunk_size, overlap)

    # Step 5: Attach metadata
    results: List[Dict] = []
    for chunk in chunks:
        if len(chunk.strip()) < 30:
            continue
            
        meta = extract_metadata(chunk, filepath, act_name, law_type)
        results.append({
            "id": None, # Will be populated in main()
            "text": chunk,
            "source": _detect_source(chunk, act_name),
            "metadata": meta,
        })

    return results


# ===========================================================================
# MAIN PIPELINE
# ===========================================================================

def main() -> None:
    """
    Main entry point — orchestrates the full ingestion pipeline.
    """
    # -----------------------------------------------------------------------
    # CLI argument parsing
    # -----------------------------------------------------------------------
    parser = argparse.ArgumentParser(
        description="LexisCo Phase 1 — Legal Document Ingestion Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python backend/scripts/ingest_data.py
  python backend/scripts/ingest_data.py --data-dir ./my_laws
  python backend/scripts/ingest_data.py --chunk-size 1200 --overlap 150
        """,
    )
    parser.add_argument(
        "--data-dir",
        default=None,
        help="Directory containing raw legal documents (default: backend/data/)",
    )
    parser.add_argument(
        "--output",
        default=None,
        help="Output JSON file path (default: backend/data/processed_chunks.json)",
    )
    parser.add_argument(
        "--chunk-size",
        type=int,
        default=DEFAULT_CHUNK_SIZE,
        help=f"Target chunk size in characters (default: {DEFAULT_CHUNK_SIZE})",
    )
    parser.add_argument(
        "--overlap",
        type=int,
        default=DEFAULT_OVERLAP,
        help=f"Chunk overlap in characters (default: {DEFAULT_OVERLAP})",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable debug-level logging",
    )
    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # -----------------------------------------------------------------------
    # Resolve paths (script-location-relative defaults)
    # -----------------------------------------------------------------------
    script_dir = Path(__file__).resolve().parent           # backend/scripts/
    backend_dir = script_dir.parent                        # backend/
    data_dir = Path(args.data_dir) if args.data_dir else backend_dir / "data"
    output_path = Path(args.output) if args.output else data_dir / "processed_chunks.json"

    logger.info("=" * 60)
    logger.info("LexisCo — Legal Document Ingestion Pipeline")
    logger.info("=" * 60)
    logger.info("Data directory : %s", data_dir)
    logger.info("Output file    : %s", output_path)
    logger.info("Chunk size     : %d chars", args.chunk_size)
    logger.info("Overlap        : %d chars", args.overlap)
    logger.info("-" * 60)

    # -----------------------------------------------------------------------
    # Process all files
    # -----------------------------------------------------------------------
    all_chunks: List[Dict] = []
    files_processed = 0
    files_skipped = 0

    global_chunk_id = 1

    for filepath, ext in load_files(str(data_dir)):
        try:
            doc_chunks = process_document(filepath, ext, args.chunk_size, args.overlap)
            if doc_chunks:
                for ch in doc_chunks:
                    ch["id"] = global_chunk_id
                    global_chunk_id += 1
                all_chunks.extend(doc_chunks)
                files_processed += 1
            else:
                files_skipped += 1
        except Exception as exc:
            logger.error("  ✖ Error processing %s: %s", filepath.name, exc)
            files_skipped += 1

    # -----------------------------------------------------------------------
    # Save output
    # -----------------------------------------------------------------------
    if not all_chunks:
        logger.warning("No chunks were generated. Check your data directory.")
        logger.info(
            "Place .txt or .pdf legal documents in: %s", data_dir
        )
        # Still write an empty file so downstream tools don't break
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text("[]", encoding="utf-8")
        return

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, indent=2, ensure_ascii=False)

    # -----------------------------------------------------------------------
    # CLI summary
    # -----------------------------------------------------------------------
    logger.info("-" * 60)
    logger.info("✅ INGESTION COMPLETE")
    logger.info("-" * 60)
    logger.info("  Files processed : %d", files_processed)
    logger.info("  Files skipped   : %d", files_skipped)
    logger.info("  Total chunks    : %d", len(all_chunks))
    logger.info("  Output saved to : %s", output_path)

    print(f"\nTotal chunks processed: {len(all_chunks)}")

    # Print sample chunk preview
    if all_chunks:
        sample = all_chunks[0]
        preview_text = sample["text"][:200] + ("..." if len(sample["text"]) > 200 else "")
        logger.info("-" * 60)
        logger.info("📋 SAMPLE CHUNK PREVIEW:")
        logger.info("-" * 60)
        logger.info("  Act    : %s", sample["metadata"]["act_name"])
        logger.info("  Source : %s", sample["source"])
        logger.info("  Section: %s", sample["metadata"]["section"])
        logger.info("  Title  : %s", sample["metadata"]["title"])
        logger.info("  Type   : %s", sample["metadata"]["law_type"])
        logger.info("  Lang   : %s", sample["metadata"]["language"])
        logger.info("  Text   :\n    %s", preview_text)

    # Print law-type distribution
    type_counts: Dict[str, int] = {}
    for chunk in all_chunks:
        lt = chunk["metadata"]["law_type"]
        type_counts[lt] = type_counts.get(lt, 0) + 1

    logger.info("-" * 60)
    logger.info("📊 CHUNK DISTRIBUTION BY LAW TYPE:")
    for lt, count in sorted(type_counts.items(), key=lambda x: -x[1]):
        logger.info("  %-15s : %d chunks", lt, count)
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
