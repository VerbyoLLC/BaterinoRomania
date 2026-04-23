-- Add HP K series models to product_models
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
  'cmprodmdlhp2000k00013',
  'HP2000K',
  'HP',
  'HP2000K',
  $t0$Model-specific:
Nominal Voltage: 204.8V
Nominal Capacity: 100Ah
Charge & Discharge Current: Charge: 40A; Discharge: 100A
Energy: 20.48kWh
Battery Modules: 4
Cycle life: 6000 Times
Rated Output Power: 20 kW
Dimensions (L×W×H): 58×39×91.8 cm
Weight: ≈213 kg

Common (all models in this range):
Chemistry: LiFePO4
Bluetooth/WiFi: Optional
Communication: RS485, Monitor, CAN
Waterproof: IP20/IP54 (Optional)
Noise Level: <10dB
Charge Temperature: 0°C to 55°C (32°F to 131°F)
Discharge Temperature: -20°C to 60°C (-4°F to 140°F)
Storage Temperature: 0°C to 35°C (32°F to 95°F)
Altitude: <=3000m
Warranty: 10 Years
Certification: CE, UN38.3, IEC62619, IEC62477, RoHS, UL1973 (on going)$t0$,
  13,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "product_models" WHERE "modelNumber" = 'HP2000K'
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
  'cmprodmdlhp2500k00014',
  'HP2500K',
  'HP',
  'HP2500K',
  $t1$Model-specific:
Nominal Voltage: 256V
Nominal Capacity: 100Ah
Charge & Discharge Current: Charge: 40A; Discharge: 100A
Energy: 25.6kWh
Battery Modules: 5
Cycle life: 6000 Times
Rated Output Power: 25 kW
Dimensions (L×W×H): 58×39×108.9 cm
Weight: ≈259.5 kg

Common (all models in this range):
Chemistry: LiFePO4
Bluetooth/WiFi: Optional
Communication: RS485, Monitor, CAN
Waterproof: IP20/IP54 (Optional)
Noise Level: <10dB
Charge Temperature: 0°C to 55°C (32°F to 131°F)
Discharge Temperature: -20°C to 60°C (-4°F to 140°F)
Storage Temperature: 0°C to 35°C (32°F to 95°F)
Altitude: <=3000m
Warranty: 10 Years
Certification: CE, UN38.3, IEC62619, IEC62477, RoHS, UL1973 (on going)$t1$,
  14,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "product_models" WHERE "modelNumber" = 'HP2500K'
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
  'cmprodmdlhp3000k00015',
  'HP3000K',
  'HP',
  'HP3000K',
  $t2$Model-specific:
Nominal Voltage: 307.2V
Nominal Capacity: 100Ah
Charge & Discharge Current: Charge: 40A; Discharge: 100A
Energy: 30.72kWh
Battery Modules: 6
Cycle life: 6000 Times
Rated Output Power: 30 kW
Dimensions (L×W×H): 58×39×126 cm
Weight: ≈306 kg

Common (all models in this range):
Chemistry: LiFePO4
Bluetooth/WiFi: Optional
Communication: RS485, Monitor, CAN
Waterproof: IP20/IP54 (Optional)
Noise Level: <10dB
Charge Temperature: 0°C to 55°C (32°F to 131°F)
Discharge Temperature: -20°C to 60°C (-4°F to 140°F)
Storage Temperature: 0°C to 35°C (32°F to 95°F)
Altitude: <=3000m
Warranty: 10 Years
Certification: CE, UN38.3, IEC62619, IEC62477, RoHS, UL1973 (on going)$t2$,
  15,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "product_models" WHERE "modelNumber" = 'HP3000K'
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
  'cmprodmdlhp3500k00016',
  'HP3500K',
  'HP',
  'HP3500K',
  $t3$Model-specific:
Nominal Voltage: 358.4V
Nominal Capacity: 100Ah
Charge & Discharge Current: Charge: 40A; Discharge: 100A
Energy: 35.84kWh
Battery Modules: 7
Cycle life: 6000 Times
Rated Output Power: 35 kW
Dimensions (L×W×H): 58×39×143.1 cm
Weight: ≈352.5 kg

Common (all models in this range):
Chemistry: LiFePO4
Bluetooth/WiFi: Optional
Communication: RS485, Monitor, CAN
Waterproof: IP20/IP54 (Optional)
Noise Level: <10dB
Charge Temperature: 0°C to 55°C (32°F to 131°F)
Discharge Temperature: -20°C to 60°C (-4°F to 140°F)
Storage Temperature: 0°C to 35°C (32°F to 95°F)
Altitude: <=3000m
Warranty: 10 Years
Certification: CE, UN38.3, IEC62619, IEC62477, RoHS, UL1973 (on going)$t3$,
  16,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "product_models" WHERE "modelNumber" = 'HP3500K'
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
  'cmprodmdlhp4000k00017',
  'HP4000K',
  'HP',
  'HP4000K',
  $t4$Model-specific:
Nominal Voltage: 409.6V
Nominal Capacity: 100Ah
Charge & Discharge Current: Charge: 40A; Discharge: 100A
Energy: 40.96kWh
Battery Modules: 8
Cycle life: 6000 Times
Rated Output Power: 40 kW
Dimensions (L×W×H): 58×39×160.2 cm
Weight: ≈399 kg

Common (all models in this range):
Chemistry: LiFePO4
Bluetooth/WiFi: Optional
Communication: RS485, Monitor, CAN
Waterproof: IP20/IP54 (Optional)
Noise Level: <10dB
Charge Temperature: 0°C to 55°C (32°F to 131°F)
Discharge Temperature: -20°C to 60°C (-4°F to 140°F)
Storage Temperature: 0°C to 35°C (32°F to 95°F)
Altitude: <=3000m
Warranty: 10 Years
Certification: CE, UN38.3, IEC62619, IEC62477, RoHS, UL1973 (on going)$t4$,
  17,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "product_models" WHERE "modelNumber" = 'HP4000K'
);
