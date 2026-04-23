-- Add TR Pro rack models to product_models
INSERT INTO "product_models" (
  "id",
  "name",
  "brand",
  "modelNumber",
  "technicalDescription",
  "sortOrder",
  "createdAt",
  "updatedAt"
)
SELECT
  'cmprodmdltr6000wxpro005',
  'TR6000WX-Pro',
  'TR',
  'TR6000WX-Pro',
  $t0$Model-specific:
Nominal Voltage: 51.2V
Nominal Capacity: 200Ah
Charge & Discharge Current: 200A
Energy: 10.24kWh
Cycle life: 6000 Times
Rated Output Power: 10kW
Dimensions (H×L×D): 83×62×17.9 cm
Weight: ≈99.5 kg

Common (all models in this range):
Chemistry: LiFePO4
Certification: CE, UN38.3, RoHS, MSDS
Communication: RS485, RS232, CAN
WIFI/BT: Yes
Self-Heating: Optional
Waterproof: IP66
Noise Level: <10dB
Charge Temperature: 0°C to 55°C (32°F to 131°F)
Discharge Temperature: -20°C to 60°C (-4°F to 140°F)
Recommend Operating Temperature: 15°C to 35°C (59°F to 95°F)
Storage Temperature: 0°C to 35°C (32°F to 95°F)
Altitude: <=3000m
Warranty: 10 Years$t0$,
  5,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "product_models" WHERE "modelNumber" = 'TR6000WX-Pro'
);

INSERT INTO "product_models" (
  "id",
  "name",
  "brand",
  "modelNumber",
  "technicalDescription",
  "sortOrder",
  "createdAt",
  "updatedAt"
)
SELECT
  'cmprodmdltr8500wxpro006',
  'TR8500WX-Pro',
  'TR',
  'TR8500WX-Pro',
  $t1$Model-specific:
Nominal Voltage: 51.2V
Nominal Capacity: 314Ah
Charge & Discharge Current: 200A
Energy: 16.076kWh
Cycle life: 8000 Times
Rated Output Power: 10kW
Dimensions (H×L×D): 85×65×23 cm
Weight: ≈135.5 kg

Common (all models in this range):
Chemistry: LiFePO4
Certification: CE, UN38.3, RoHS, MSDS
Communication: RS485, RS232, CAN
WIFI/BT: Yes
Self-Heating: Optional
Waterproof: IP66
Noise Level: <10dB
Charge Temperature: 0°C to 55°C (32°F to 131°F)
Discharge Temperature: -20°C to 60°C (-4°F to 140°F)
Recommend Operating Temperature: 15°C to 35°C (59°F to 95°F)
Storage Temperature: 0°C to 35°C (32°F to 95°F)
Altitude: <=3000m
Warranty: 10 Years$t1$,
  6,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "product_models" WHERE "modelNumber" = 'TR8500WX-Pro'
);
