-- Run this script in the Supabase SQL Editor

-- 1. Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- 2. Create the legal documents table
create table if not exists legal_documents (
  id bigint primary key generated always as identity,
  act_name text,
  section text,
  title text,
  law_type text,
  language text,
  source_file text,
  chunk_text text not null,
  embedding vector(384) -- 384 dimensions for all-MiniLM-L6-v2 model 
);

-- 3. Create a function to search for documents using cosine similarity
create or replace function match_legal_documents (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  act_name text,
  section text,
  title text,
  chunk_text text,
  similarity float
)
language sql stable
as $$
  select
    legal_documents.id,
    legal_documents.act_name,
    legal_documents.section,
    legal_documents.title,
    legal_documents.chunk_text,
    1 - (legal_documents.embedding <=> query_embedding) as similarity
  from legal_documents
  where 1 - (legal_documents.embedding <=> query_embedding) > match_threshold
  order by legal_documents.embedding <=> query_embedding
  limit match_count;
$$;

-- 4. Create an index for faster similarity searches uses HNSW algorithm
create index on legal_documents using hnsw (embedding vector_cosine_ops);
