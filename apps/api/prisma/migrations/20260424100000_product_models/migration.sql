-- Product models (admin Inventar → Modele) — TR rack LiFePO4 line
CREATE TABLE "product_models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "modelNumber" TEXT NOT NULL,
    "technicalDescription" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_models_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "product_models_modelNumber_key" ON "product_models"("modelNumber");

CREATE INDEX "product_models_sortOrder_idx" ON "product_models"("sortOrder");

INSERT INTO "product_models" ("id", "name", "brand", "modelNumber", "technicalDescription", "sortOrder", "createdAt", "updatedAt")
VALUES
(
  'cmprodmdltr4000wx00001',
  'TR4000WX',
  'TR',
  'TR4000WX',
  $t0$Model-specific:
Nominal Voltage: 51.2V
Nominal Capacity: 100Ah
Charge & Discharge Current: 100A
Energy: 5.12kWh
Cycle life: 6000 Times
Rated Output Power: 5kW
Discharge Temperature: -20°C to 65°C (-4°F to 149°F)
Dimensions (W×H×D): 50×60×16.7 cm
Weight: ≈53.5 kg

Common (all models in this range):
Chemistry: LiFePO4
Certification: CE, UN38.3, RoHS, IEC62619, IEC62368
Communication: RS485, RS232, CAN
WIFI/BT: Yes
Self-Heating: Optional
Waterproof: IP21/IP54 (Optional)
Noise Level: <10dB
Charge Temperature: 0°C to 55°C (32°F to 131°F)
Recommend Operating Temperature: 15°C to 35°C (59°F to 95°F)
Storage Temperature: 0°C to 35°C (32°F to 95°F)
Altitude: <=3000m
Warranty: 10 Years$t0$,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'cmprodmdltr6000wx00002',
  'TR6000WX',
  'TR',
  'TR6000WX',
  $t1$Model-specific:
Nominal Voltage: 51.2V
Nominal Capacity: 200Ah
Charge & Discharge Current: 200A
Energy: 10.24kWh
Cycle life: 6000 Times
Rated Output Power: 10kW
Discharge Temperature: -20°C to 65°C (-4°F to 149°F)
Dimensions (W×H×D): 65×85×16.7 cm
Weight: ≈99.5 kg

Common (all models in this range):
Chemistry: LiFePO4
Certification: CE, UN38.3, RoHS, IEC62619, IEC62368
Communication: RS485, RS232, CAN
WIFI/BT: Yes
Self-Heating: Optional
Waterproof: IP21/IP54 (Optional)
Noise Level: <10dB
Charge Temperature: 0°C to 55°C (32°F to 131°F)
Recommend Operating Temperature: 15°C to 35°C (59°F to 95°F)
Storage Temperature: 0°C to 35°C (32°F to 95°F)
Altitude: <=3000m
Warranty: 10 Years$t1$,
  2,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'cmprodmdltr8000wx00003',
  'TR8000WX',
  'TR',
  'TR8000WX',
  $t2$Model-specific:
Nominal Voltage: 51.2V
Nominal Capacity: 280Ah
Charge & Discharge Current: 200A
Energy: 14.336kWh
Cycle life: 8000 Times
Rated Output Power: 10kW
Discharge Temperature: -20°C to 60°C (-4°F to 140°F)
Dimensions (W×H×D): 65×85×24.5 cm
Weight: ≈132.5 kg

Common (all models in this range):
Chemistry: LiFePO4
Certification: CE, UN38.3, RoHS, IEC62619, IEC62368
Communication: RS485, RS232, CAN
WIFI/BT: Yes
Self-Heating: Optional
Waterproof: IP21/IP54 (Optional)
Noise Level: <10dB
Charge Temperature: 0°C to 55°C (32°F to 131°F)
Recommend Operating Temperature: 15°C to 35°C (59°F to 95°F)
Storage Temperature: 0°C to 35°C (32°F to 95°F)
Altitude: <=3000m
Warranty: 10 Years$t2$,
  3,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'cmprodmdltr8500wx00004',
  'TR8500WX',
  'TR',
  'TR8500WX',
  $t3$Model-specific:
Nominal Voltage: 51.2V
Nominal Capacity: 314Ah
Charge & Discharge Current: 157A / 200A
Energy: 16.076kWh
Cycle life: 8000 Times
Rated Output Power: 10kW
Discharge Temperature: -20°C to 60°C (-4°F to 140°F)
Dimensions (W×H×D): 65×85×24.5 cm
Weight: ≈135.5 kg

Common (all models in this range):
Chemistry: LiFePO4
Certification: CE, UN38.3, RoHS, IEC62619, IEC62368
Communication: RS485, RS232, CAN
WIFI/BT: Yes
Self-Heating: Optional
Waterproof: IP21/IP54 (Optional)
Noise Level: <10dB
Charge Temperature: 0°C to 55°C (32°F to 131°F)
Recommend Operating Temperature: 15°C to 35°C (59°F to 95°F)
Storage Temperature: 0°C to 35°C (32°F to 95°F)
Altitude: <=3000m
Warranty: 10 Years$t3$,
  4,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
