-- Add TB X series and TA6000-M series models to product_models
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
  'cmprodmdltb4000x00018',
  'TB4000X',
  'TB',
  'TB4000X',
  $t0$Model-specific:
Nominal Voltage: 51.2V
Nominal Capacity: 100Ah
Charge & Discharge Current: 100A
Energy: 5.12kWh
Cycle life: 5000 Times
Rated Output Power: 5kW
WIFI/BT: No
Dimensions (W×H×D): 482×178×420 mm
Weight: ≈42kg

Common (all models in this range):
Chemistry: LiFePO4
Certification: CE, UN38.3, RoHS, UL1973 (on going)
Communication: RS485, CAN, RS232 (Ethernet)
Waterproof: IP20/Splashproof
Noise Level: <10dB
Charge Temperature: 0°C to 55°C (32°F to 131°F)
Discharge Temperature: -20°C to 60°C (-4°F to 140°F)
Recommend Operating Temperature: 15°C to 35°C (59°F to 95°F)
Storage Temperature: 0°C to 35°C (32°F to 95°F)
Altitude: <= 3000m
Warranty: 5 Years / 10 Years (Optional)$t0$,
  18,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "product_models" WHERE "modelNumber" = 'TB4000X'
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
  'cmprodmdltb6000x00019',
  'TB6000X',
  'TB',
  'TB6000X',
  $t1$Model-specific:
Nominal Voltage: 51.2V
Nominal Capacity: 200Ah
Charge & Discharge Current: 200A
Energy: 10.24kWh
Cycle life: 5000 Times
Rated Output Power: 10kW
WIFI/BT: Yes
Dimensions (W×H×D): 482×223×550 mm
Weight: ≈78kg

Common (all models in this range):
Chemistry: LiFePO4
Certification: CE, UN38.3, RoHS, UL1973 (on going)
Communication: RS485, CAN, RS232 (Ethernet)
Waterproof: IP20/Splashproof
Noise Level: <10dB
Charge Temperature: 0°C to 55°C (32°F to 131°F)
Discharge Temperature: -20°C to 60°C (-4°F to 140°F)
Recommend Operating Temperature: 15°C to 35°C (59°F to 95°F)
Storage Temperature: 0°C to 35°C (32°F to 95°F)
Altitude: <= 3000m
Warranty: 5 Years / 10 Years (Optional)$t1$,
  19,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "product_models" WHERE "modelNumber" = 'TB6000X'
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
  'cmprodmdltb8000x00020',
  'TB8000X',
  'TB',
  'TB8000X',
  $t2$Model-specific:
Nominal Voltage: 51.2V
Nominal Capacity: 280Ah
Charge & Discharge Current: 200A
Energy: 14.336kWh
Cycle life: 8000 Times
Rated Output Power: 10kW
WIFI/BT: Yes
Dimensions (W×H×D): 482×223×710 mm
Weight: ≈109.5kg

Common (all models in this range):
Chemistry: LiFePO4
Certification: CE, UN38.3, RoHS, UL1973 (on going)
Communication: RS485, CAN, RS232 (Ethernet)
Waterproof: IP20/Splashproof
Noise Level: <10dB
Charge Temperature: 0°C to 55°C (32°F to 131°F)
Discharge Temperature: -20°C to 60°C (-4°F to 140°F)
Recommend Operating Temperature: 15°C to 35°C (59°F to 95°F)
Storage Temperature: 0°C to 35°C (32°F to 95°F)
Altitude: <= 3000m
Warranty: 5 Years / 10 Years (Optional)$t2$,
  20,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "product_models" WHERE "modelNumber" = 'TB8000X'
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
  'cmprodmdltb8500x00021',
  'TB8500X',
  'TB',
  'TB8500X',
  $t3$Model-specific:
Nominal Voltage: 51.2V
Nominal Capacity: 314Ah
Charge & Discharge Current: 200A
Energy: 16.076kWh
Cycle life: 8000 Times
Rated Output Power: 10kW
WIFI/BT: Yes
Dimensions (W×H×D): 482×223×710 mm
Weight: ≈112kg

Common (all models in this range):
Chemistry: LiFePO4
Certification: CE, UN38.3, RoHS, UL1973 (on going)
Communication: RS485, CAN, RS232 (Ethernet)
Waterproof: IP20/Splashproof
Noise Level: <10dB
Charge Temperature: 0°C to 55°C (32°F to 131°F)
Discharge Temperature: -20°C to 60°C (-4°F to 140°F)
Recommend Operating Temperature: 15°C to 35°C (59°F to 95°F)
Storage Temperature: 0°C to 35°C (32°F to 95°F)
Altitude: <= 3000m
Warranty: 5 Years / 10 Years (Optional)$t3$,
  21,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "product_models" WHERE "modelNumber" = 'TB8500X'
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
  'cmprodmdlta6000m200022',
  'TA6000-M2',
  'TA',
  'TA6000-M2',
  $t4$Model-specific:
Nominal Voltage: 51.2V
Nominal Capacity: 200Ah
Max Charge & Disharge Current: 200A
Energy: 10.24kWh
Cycle life: 5000 Times
Rated Output Power: 6~10kW (Optional)
Rated Output Voltage: 120V(US) / 230V(EU)
PV Input Power: 11 kW
MPPT efficiency: 99.9%
Dimensions (W×D×H): W590mm*D570mm*H1880mm
Weight: ≈244kg

Common (all models in this range):
Chemistry: LiFePO4
Grid frequency range: 50Hz / 60Hz
Certification: CE / UN38.3 / MSDS / UL9540 (on going)
Communication: RS485, RS232, CAN/WIFI, Bluetooth (Optional)
Operating Temperature: -20°C to 60°C (-4°F to 140°F)
Warranty: 5 Years / 10 Years (Optional)$t4$,
  22,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "product_models" WHERE "modelNumber" = 'TA6000-M2'
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
  'cmprodmdlta6000m300023',
  'TA6000-M3',
  'TA',
  'TA6000-M3',
  $t5$Model-specific:
Nominal Voltage: 51.2V
Nominal Capacity: 300Ah
Max Charge & Disharge Current: 300A
Energy: 15.36kWh
Cycle life: 5000 Times
Rated Output Power: 6~12kW (Optional)
Rated Output Voltage: 120V(US) / 230V(EU)
PV Input Power: 11~13.2 kW
MPPT efficiency: 99.9%
Dimensions (W×D×H): W590mm*D570mm*H1880mm
Weight: ≈286kg

Common (all models in this range):
Chemistry: LiFePO4
Grid frequency range: 50Hz / 60Hz
Certification: CE / UN38.3 / MSDS / UL9540 (on going)
Communication: RS485, RS232, CAN/WIFI, Bluetooth (Optional)
Operating Temperature: -20°C to 60°C (-4°F to 140°F)
Warranty: 5 Years / 10 Years (Optional)$t5$,
  23,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "product_models" WHERE "modelNumber" = 'TA6000-M3'
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
  'cmprodmdlta6000m400024',
  'TA6000-M4',
  'TA',
  'TA6000-M4',
  $t6$Model-specific:
Nominal Voltage: 51.2V
Nominal Capacity: 400Ah
Max Charge & Disharge Current: 400A
Energy: 20.48kWh
Cycle life: 5000 Times
Rated Output Power: 6~12kW (Optional)
Rated Output Voltage: 120V(US) / 230V(EU)
PV Input Power: 11~13.2 kW
MPPT efficiency: 99.9%
Dimensions (W×D×H): W590mm*D570mm*H1880mm
Weight: ≈328kg

Common (all models in this range):
Chemistry: LiFePO4
Grid frequency range: 50Hz / 60Hz
Certification: CE / UN38.3 / MSDS / UL9540 (on going)
Communication: RS485, RS232, CAN/WIFI, Bluetooth (Optional)
Operating Temperature: -20°C to 60°C (-4°F to 140°F)
Warranty: 5 Years / 10 Years (Optional)$t6$,
  24,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "product_models" WHERE "modelNumber" = 'TA6000-M4'
);
