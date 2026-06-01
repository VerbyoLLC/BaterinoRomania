UPDATE "Product" SET "partnerSalePrice" = "salePrice" WHERE "partnerSalePrice" = 0 AND "salePrice" > 0;
