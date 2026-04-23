-- Add HP Ultra series models to product_models
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
  'cmprodmdlhpultra800007',
  'HP Ultra-8.0',
  'HP',
  'HP Ultra-8.0',
  $t0$Series: HP Ultra
Model: HP Ultra-8.0
Maximum Units: 16
BMS Output Voltage: 600V
Nominal Capacity: 314Ah
Charge & Discharge Current: 7A
Energy: 8kWh
Cycle Life: >=8000 time (DOD 100% @ 25℃)
Max Power: 4kWh
Dimensions (W×D×H): 95×31.5×57.5 cm
Weight: ≈75kg

Common (all models in this range):
Chemistry: LFP
Communication: Bluetooth/WIFI/CAN/RS485
Waterproof: IP66
Protection: Fire Extinguisher/Self-heating
Material: Aluminum Aloy(C4-Level)
Charge Temperature: -20℃ to 60℃ (-4℉ to 140℉)
Disharge Temperature: -30℃ to 60℃ (-22℉ to 140℉)
Storage Temperature: 0℃ to 35℃ (32℉ to 95℉)
Altitude: <= 4000m
Warranty: 10 Years
Installation Method: Floor Standing / Wall-Mounted
Certification: CE, UN38.3, IEC62619, IEC62477, RoHS, UL1973 (on going)$t0$,
  7,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "product_models" WHERE "modelNumber" = 'HP Ultra-8.0'
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
  'cmprodmdlhpultra160008',
  'HP Ultra-16.0',
  'HP',
  'HP Ultra-16.0',
  $t1$Series: HP Ultra
Model: HP Ultra-16.0
Maximum Units: 16
BMS Output Voltage: 600V
Nominal Capacity: 628Ah
Charge & Discharge Current: 14A
Energy: 16kWh
Cycle Life: >=8000 time (DOD 100% @ 25℃)
Max Power: 8kWh
Dimensions (W×D×H): 95×31.5×88 cm
Weight: ≈130kg

Common (all models in this range):
Chemistry: LFP
Communication: Bluetooth/WIFI/CAN/RS485
Waterproof: IP66
Protection: Fire Extinguisher/Self-heating
Material: Aluminum Aloy(C4-Level)
Charge Temperature: -20℃ to 60℃ (-4℉ to 140℉)
Disharge Temperature: -30℃ to 60℃ (-22℉ to 140℉)
Storage Temperature: 0℃ to 35℃ (32℉ to 95℉)
Altitude: <= 4000m
Warranty: 10 Years
Installation Method: Floor Standing / Wall-Mounted
Certification: CE, UN38.3, IEC62619, IEC62477, RoHS, UL1973 (on going)$t1$,
  8,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "product_models" WHERE "modelNumber" = 'HP Ultra-16.0'
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
  'cmprodmdlhpultra240009',
  'HP Ultra-24.0',
  'HP',
  'HP Ultra-24.0',
  $t2$Series: HP Ultra
Model: HP Ultra-24.0
Maximum Units: 16
BMS Output Voltage: 600V
Nominal Capacity: 942Ah
Charge & Discharge Current: 21A
Energy: 24kWh
Cycle Life: >=8000 time (DOD 100% @ 25℃)
Max Power: 12kWh
Dimensions (W×D×H): 95×31.5×118.5 cm
Weight: ≈185kg

Common (all models in this range):
Chemistry: LFP
Communication: Bluetooth/WIFI/CAN/RS485
Waterproof: IP66
Protection: Fire Extinguisher/Self-heating
Material: Aluminum Aloy(C4-Level)
Charge Temperature: -20℃ to 60℃ (-4℉ to 140℉)
Disharge Temperature: -30℃ to 60℃ (-22℉ to 140℉)
Storage Temperature: 0℃ to 35℃ (32℉ to 95℉)
Altitude: <= 4000m
Warranty: 10 Years
Installation Method: Floor Standing / Wall-Mounted
Certification: CE, UN38.3, IEC62619, IEC62477, RoHS, UL1973 (on going)$t2$,
  9,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "product_models" WHERE "modelNumber" = 'HP Ultra-24.0'
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
  'cmprodmdlhpultra320010',
  'HP Ultra-32.0',
  'HP',
  'HP Ultra-32.0',
  $t3$Series: HP Ultra
Model: HP Ultra-32.0
Maximum Units: 16
BMS Output Voltage: 600V
Nominal Capacity: 1256Ah
Charge & Discharge Current: 28A
Energy: 32kWh
Cycle Life: >=8000 time (DOD 100% @ 25℃)
Max Power: 16kWh
Dimensions (W×D×H): 95×31.5×149 cm
Weight: ≈240kg

Common (all models in this range):
Chemistry: LFP
Communication: Bluetooth/WIFI/CAN/RS485
Waterproof: IP66
Protection: Fire Extinguisher/Self-heating
Material: Aluminum Aloy(C4-Level)
Charge Temperature: -20℃ to 60℃ (-4℉ to 140℉)
Disharge Temperature: -30℃ to 60℃ (-22℉ to 140℉)
Storage Temperature: 0℃ to 35℃ (32℉ to 95℉)
Altitude: <= 4000m
Warranty: 10 Years
Installation Method: Floor Standing / Wall-Mounted
Certification: CE, UN38.3, IEC62619, IEC62477, RoHS, UL1973 (on going)$t3$,
  10,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "product_models" WHERE "modelNumber" = 'HP Ultra-32.0'
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
  'cmprodmdlhpultra400011',
  'HP Ultra-40.0',
  'HP',
  'HP Ultra-40.0',
  $t4$Series: HP Ultra
Model: HP Ultra-40.0
Maximum Units: 16
BMS Output Voltage: 600V
Nominal Capacity: 1570Ah
Charge & Discharge Current: 35A
Energy: 40kWh
Cycle Life: >=8000 time (DOD 100% @ 25℃)
Max Power: 20kWh
Dimensions (W×D×H): 95×31.5×179.5 cm
Weight: ≈295kg

Common (all models in this range):
Chemistry: LFP
Communication: Bluetooth/WIFI/CAN/RS485
Waterproof: IP66
Protection: Fire Extinguisher/Self-heating
Material: Aluminum Aloy(C4-Level)
Charge Temperature: -20℃ to 60℃ (-4℉ to 140℉)
Disharge Temperature: -30℃ to 60℃ (-22℉ to 140℉)
Storage Temperature: 0℃ to 35℃ (32℉ to 95℉)
Altitude: <= 4000m
Warranty: 10 Years
Installation Method: Floor Standing / Wall-Mounted
Certification: CE, UN38.3, IEC62619, IEC62477, RoHS, UL1973 (on going)$t4$,
  11,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "product_models" WHERE "modelNumber" = 'HP Ultra-40.0'
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
  'cmprodmdlhpultra480012',
  'HP Ultra-48.0',
  'HP',
  'HP Ultra-48.0',
  $t5$Series: HP Ultra
Model: HP Ultra-48.0
Maximum Units: 16
BMS Output Voltage: 600V
Nominal Capacity: 1884Ah
Charge & Discharge Current: 42A
Energy: 48kWh
Cycle Life: >=8000 time (DOD 100% @ 25℃)
Max Power: 24kWh
Dimensions (W×D×H): 95×31.5×210 cm
Weight: ≈350kg

Common (all models in this range):
Chemistry: LFP
Communication: Bluetooth/WIFI/CAN/RS485
Waterproof: IP66
Protection: Fire Extinguisher/Self-heating
Material: Aluminum Aloy(C4-Level)
Charge Temperature: -20℃ to 60℃ (-4℉ to 140℉)
Disharge Temperature: -30℃ to 60℃ (-22℉ to 140℉)
Storage Temperature: 0℃ to 35℃ (32℉ to 95℉)
Altitude: <= 4000m
Warranty: 10 Years
Installation Method: Floor Standing / Wall-Mounted
Certification: CE, UN38.3, IEC62619, IEC62477, RoHS, UL1973 (on going)$t5$,
  12,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "product_models" WHERE "modelNumber" = 'HP Ultra-48.0'
);
