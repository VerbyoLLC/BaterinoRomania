-- Optional link: which discount programs (ReducereProgram.id) apply to this product for the residential purchase dropdown
ALTER TABLE "Product" ADD COLUMN "reducereProgramIds" JSONB NOT NULL DEFAULT '[]';
