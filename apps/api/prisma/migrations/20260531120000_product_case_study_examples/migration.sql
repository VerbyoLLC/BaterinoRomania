-- Product detail: installation case study examples (title, subtitle, image)
ALTER TABLE "Product" ADD COLUMN "caseStudyExamples" JSONB NOT NULL DEFAULT '[]';
