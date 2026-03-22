// ─── Types ────────────────────────────────────────────────────────────────────

export type PackageStatus = 'Pending' | 'Ready to Sell';
export type ActivityType = 'Webinar' | 'Video' | 'Practical' | 'Exam' | 'Reading';
export type DeliveryType = 'Online' | 'In-Person' | 'Hybrid';
export type TradeType = 'Electrical' | 'Gas Engineering' | 'Plumbing' | 'Multi-Trade';

export interface FinanceActivity {
  id: string;
  name: string;
  type: ActivityType;
  delivery: DeliveryType;
}

export interface FinanceStage {
  id: string;
  order: number;
  courseName: string;
  price: number;
  durationHours: number;
  durationMinutes: number;
  activities: FinanceActivity[];
  revenueRecognition: number;
  exposedRefund: number;
  /** Admin: module can be offered/sold in this package context */
  isSellable: boolean;
  /** Admin: sales commission applies to this module */
  isCommissionable: boolean;
}

export interface FinancePackage {
  id: string;
  name: string;
  description: string;
  trade: TradeType;
  status: PackageStatus;
  digitalAccessPercent: number;
  totalPrice: number;
  stages: FinanceStage[];
  isReadyToSell: boolean;
  courseCount: number;
  moduleCount: number;
  webinarCount: number;
  assessmentCount: number;
  totalDurationHours: number;
  totalDurationMinutes: number;
  lastUpdated: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const financePackages: FinancePackage[] = [
  {
    id: 'pkg-domestic-electrician',
    name: 'Domestic Electrician Package',
    description: 'Complete training package for domestic electrical installation and maintenance',
    trade: 'Electrical',
    status: 'Ready to Sell',
    digitalAccessPercent: 5,
    totalPrice: 4680,
    isReadyToSell: true,
    courseCount: 3,
    moduleCount: 8,
    webinarCount: 8,
    assessmentCount: 6,
    totalDurationHours: 63,
    totalDurationMinutes: 30,
    lastUpdated: '2026-02-18',
    stages: [
      {
        id: 's1',
        order: 1,
        courseName: 'Health & Safety in Electrical Work',
        price: 500,
        durationHours: 6,
        durationMinutes: 45,
        revenueRecognition: 10,
        exposedRefund: 85,
        isSellable: true,
        isCommissionable: true,
        activities: [
          { id: 'a1-1', name: 'Electrical Safety Regulations Overview', type: 'Webinar', delivery: 'Online' },
          { id: 'a1-2', name: 'Risk Assessment Workshop', type: 'Practical', delivery: 'In-Person' },
          { id: 'a1-3', name: 'PPE and Safe Isolation', type: 'Video', delivery: 'Online' },
          { id: 'a1-4', name: 'H&S Assessment', type: 'Exam', delivery: 'Online' },
        ],
      },
      {
        id: 's2',
        order: 2,
        courseName: 'Basic Electrical Science',
        price: 600,
        durationHours: 9,
        durationMinutes: 0,
        revenueRecognition: 20,
        exposedRefund: 70,
        isSellable: true,
        isCommissionable: true,
        activities: [
          { id: 'a2-1', name: "Ohm's Law & Circuit Theory", type: 'Webinar', delivery: 'Online' },
          { id: 'a2-2', name: 'Voltage, Current & Resistance', type: 'Video', delivery: 'Online' },
          { id: 'a2-3', name: 'Practical Circuit Building', type: 'Practical', delivery: 'In-Person' },
          { id: 'a2-4', name: 'Online Theory Assessment', type: 'Exam', delivery: 'Online' },
        ],
      },
      {
        id: 's3',
        order: 3,
        courseName: 'Electrical Installation Practice',
        price: 850,
        durationHours: 13,
        durationMinutes: 0,
        revenueRecognition: 18,
        exposedRefund: 55,
        isSellable: true,
        isCommissionable: true,
        activities: [
          { id: 'a3-1', name: 'Wiring Regulations BS 7671', type: 'Reading', delivery: 'Online' },
          { id: 'a3-2', name: 'Consumer Unit Installation', type: 'Practical', delivery: 'In-Person' },
          { id: 'a3-3', name: 'Cable Routing & Containment', type: 'Video', delivery: 'Online' },
          { id: 'a3-4', name: 'Installation Assessment', type: 'Exam', delivery: 'Online' },
        ],
      },
      {
        id: 's4',
        order: 4,
        courseName: 'Testing & Inspection',
        price: 750,
        durationHours: 9,
        durationMinutes: 45,
        revenueRecognition: 15,
        exposedRefund: 40,
        isSellable: true,
        isCommissionable: true,
        activities: [
          { id: 'a4-1', name: 'Initial Verification Procedures', type: 'Webinar', delivery: 'Online' },
          { id: 'a4-2', name: 'Insulation Resistance Testing', type: 'Practical', delivery: 'In-Person' },
          { id: 'a4-3', name: 'Earth Fault Loop Impedance', type: 'Video', delivery: 'Online' },
          { id: 'a4-4', name: 'RCD Testing Procedures', type: 'Practical', delivery: 'In-Person' },
          { id: 'a4-5', name: 'Periodic Inspection Exam', type: 'Exam', delivery: 'Online' },
        ],
      },
      {
        id: 's5',
        order: 5,
        courseName: 'Fault Finding & Diagnosis',
        price: 550,
        durationHours: 7,
        durationMinutes: 30,
        revenueRecognition: 12,
        exposedRefund: 30,
        isSellable: true,
        isCommissionable: true,
        activities: [
          { id: 'a5-1', name: 'Systematic Fault Finding', type: 'Webinar', delivery: 'Online' },
          { id: 'a5-2', name: 'Fault Diagnosis Workshop', type: 'Practical', delivery: 'In-Person' },
          { id: 'a5-3', name: 'Fault Assessment', type: 'Exam', delivery: 'Online' },
        ],
      },
      {
        id: 's6',
        order: 6,
        courseName: 'Part P Building Regulations',
        price: 400,
        durationHours: 3,
        durationMinutes: 45,
        revenueRecognition: 10,
        exposedRefund: 20,
        isSellable: true,
        isCommissionable: true,
        activities: [
          { id: 'a6-1', name: 'Notifiable vs Non-Notifiable Work', type: 'Reading', delivery: 'Online' },
          { id: 'a6-2', name: 'Competent Persons Scheme', type: 'Webinar', delivery: 'Online' },
          { id: 'a6-3', name: 'Part P Compliance Assessment', type: 'Exam', delivery: 'Online' },
        ],
      },
      {
        id: 's7',
        order: 7,
        courseName: 'Renewable Energy Systems',
        price: 680,
        durationHours: 10,
        durationMinutes: 0,
        revenueRecognition: 8,
        exposedRefund: 10,
        isSellable: true,
        isCommissionable: true,
        activities: [
          { id: 'a7-1', name: 'Solar PV System Design', type: 'Webinar', delivery: 'Online' },
          { id: 'a7-2', name: 'EV Charging Installation', type: 'Practical', delivery: 'In-Person' },
          { id: 'a7-3', name: 'Heat Pump Electrics', type: 'Video', delivery: 'Online' },
          { id: 'a7-4', name: 'Renewables Assessment', type: 'Exam', delivery: 'Online' },
        ],
      },
      {
        id: 's8',
        order: 8,
        courseName: 'Business Skills for Electricians',
        price: 350,
        durationHours: 3,
        durationMinutes: 45,
        revenueRecognition: 7,
        exposedRefund: 5,
        isSellable: true,
        isCommissionable: true,
        activities: [
          { id: 'a8-1', name: 'Running Your Own Business', type: 'Reading', delivery: 'Online' },
          { id: 'a8-2', name: 'Quoting & Invoicing Workshop', type: 'Webinar', delivery: 'Online' },
          { id: 'a8-3', name: 'Business Skills Assessment', type: 'Exam', delivery: 'Online' },
        ],
      },
    ],
  },
  {
    id: 'pkg-commercial-electrician',
    name: 'Commercial Electrician Package',
    description: 'Advanced training for commercial and industrial electrical installation projects',
    trade: 'Electrical',
    status: 'Ready to Sell',
    digitalAccessPercent: 8,
    totalPrice: 6200,
    isReadyToSell: true,
    courseCount: 4,
    moduleCount: 11,
    webinarCount: 12,
    assessmentCount: 8,
    totalDurationHours: 82,
    totalDurationMinutes: 0,
    lastUpdated: '2026-02-10',
    stages: [
      {
        id: 'cs1', order: 1, courseName: 'Commercial Wiring Systems',
        price: 700, durationHours: 10, durationMinutes: 0,
        revenueRecognition: 12, exposedRefund: 110, isSellable: true, isCommissionable: true,
        activities: [
          { id: 'ca1-1', name: 'Three-Phase Systems Overview', type: 'Webinar', delivery: 'Online' },
          { id: 'ca1-2', name: 'Commercial Wiring Practical', type: 'Practical', delivery: 'In-Person' },
          { id: 'ca1-3', name: 'Systems Theory Assessment', type: 'Exam', delivery: 'Online' },
        ],
      },
      {
        id: 'cs2', order: 2, courseName: 'Industrial Power Distribution',
        price: 850, durationHours: 12, durationMinutes: 0,
        revenueRecognition: 18, exposedRefund: 95, isSellable: true, isCommissionable: true,
        activities: [
          { id: 'ca2-1', name: 'Switchgear & Protection', type: 'Webinar', delivery: 'Online' },
          { id: 'ca2-2', name: 'HV/LV Substations', type: 'Video', delivery: 'Online' },
          { id: 'ca2-3', name: 'Power Distribution Workshop', type: 'Practical', delivery: 'In-Person' },
          { id: 'ca2-4', name: 'Distribution Assessment', type: 'Exam', delivery: 'Online' },
        ],
      },
      {
        id: 'cs3', order: 3, courseName: 'Motor Control & Drives',
        price: 950, durationHours: 14, durationMinutes: 30,
        revenueRecognition: 20, exposedRefund: 75, isSellable: true, isCommissionable: true,
        activities: [
          { id: 'ca3-1', name: 'Motor Starters & Control', type: 'Webinar', delivery: 'Online' },
          { id: 'ca3-2', name: 'Variable Speed Drives', type: 'Video', delivery: 'Online' },
          { id: 'ca3-3', name: 'Motor Control Practical', type: 'Practical', delivery: 'In-Person' },
          { id: 'ca3-4', name: 'Motor Assessment', type: 'Exam', delivery: 'Online' },
        ],
      },
      {
        id: 'cs4', order: 4, courseName: 'Building Management Systems',
        price: 800, durationHours: 11, durationMinutes: 0,
        revenueRecognition: 15, exposedRefund: 55, isSellable: true, isCommissionable: true,
        activities: [
          { id: 'ca4-1', name: 'BMS Architecture', type: 'Reading', delivery: 'Online' },
          { id: 'ca4-2', name: 'BMS Integration Workshop', type: 'Practical', delivery: 'In-Person' },
          { id: 'ca4-3', name: 'BMS Assessment', type: 'Exam', delivery: 'Online' },
        ],
      },
      {
        id: 'cs5', order: 5, courseName: 'Emergency & Safety Systems',
        price: 650, durationHours: 9, durationMinutes: 0,
        revenueRecognition: 13, exposedRefund: 35, isSellable: true, isCommissionable: true,
        activities: [
          { id: 'ca5-1', name: 'Fire Alarm Systems', type: 'Webinar', delivery: 'Online' },
          { id: 'ca5-2', name: 'Emergency Lighting', type: 'Practical', delivery: 'In-Person' },
          { id: 'ca5-3', name: 'Safety Systems Assessment', type: 'Exam', delivery: 'Online' },
        ],
      },
      {
        id: 'cs6', order: 6, courseName: 'Commercial Testing & Commissioning',
        price: 700, durationHours: 10, durationMinutes: 30,
        revenueRecognition: 11, exposedRefund: 20, isSellable: true, isCommissionable: true,
        activities: [
          { id: 'ca6-1', name: 'Commercial Test Procedures', type: 'Webinar', delivery: 'Online' },
          { id: 'ca6-2', name: 'Commissioning Workshop', type: 'Practical', delivery: 'In-Person' },
          { id: 'ca6-3', name: 'Testing & Commissioning Exam', type: 'Exam', delivery: 'Online' },
        ],
      },
      {
        id: 'cs7', order: 7, courseName: 'Energy Management & Efficiency',
        price: 550, durationHours: 8, durationMinutes: 0,
        revenueRecognition: 7, exposedRefund: 8, isSellable: true, isCommissionable: true,
        activities: [
          { id: 'ca7-1', name: 'Energy Auditing', type: 'Reading', delivery: 'Online' },
          { id: 'ca7-2', name: 'Energy Efficiency Assessment', type: 'Exam', delivery: 'Online' },
        ],
      },
      {
        id: 'cs8', order: 8, courseName: 'Contract Management & Compliance',
        price: 200, durationHours: 7, durationMinutes: 0,
        revenueRecognition: 4, exposedRefund: 3, isSellable: true, isCommissionable: true,
        activities: [
          { id: 'ca8-1', name: 'Contract Law for Electricians', type: 'Reading', delivery: 'Online' },
          { id: 'ca8-2', name: 'Compliance Documentation', type: 'Webinar', delivery: 'Online' },
          { id: 'ca8-3', name: 'Compliance Assessment', type: 'Exam', delivery: 'Online' },
        ],
      },
    ],
  },
  {
    id: 'pkg-gas-engineer',
    name: 'Gas Engineer Package',
    description: 'Comprehensive gas engineering qualification from fundamentals to CCN1 certification',
    trade: 'Gas Engineering',
    status: 'Pending',
    digitalAccessPercent: 0,
    totalPrice: 0,
    isReadyToSell: false,
    courseCount: 3,
    moduleCount: 9,
    webinarCount: 10,
    assessmentCount: 7,
    totalDurationHours: 75,
    totalDurationMinutes: 15,
    lastUpdated: '2026-01-29',
    stages: [
      {
        id: 'gs1', order: 1, courseName: 'Gas Safety & Regulations',
        price: 600, durationHours: 8, durationMinutes: 0,
        revenueRecognition: 0, exposedRefund: 0, isSellable: true, isCommissionable: true,
        activities: [
          { id: 'ga1-1', name: 'Gas Safety Regulations Overview', type: 'Webinar', delivery: 'Online' },
          { id: 'ga1-2', name: 'Safe Working Practices', type: 'Practical', delivery: 'In-Person' },
          { id: 'ga1-3', name: 'Gas Safety Assessment', type: 'Exam', delivery: 'Online' },
        ],
      },
      {
        id: 'gs2', order: 2, courseName: 'Combustion Principles',
        price: 700, durationHours: 9, durationMinutes: 30,
        revenueRecognition: 0, exposedRefund: 0, isSellable: true, isCommissionable: true,
        activities: [
          { id: 'ga2-1', name: 'Combustion Theory', type: 'Video', delivery: 'Online' },
          { id: 'ga2-2', name: 'Flue Systems & Ventilation', type: 'Webinar', delivery: 'Online' },
          { id: 'ga2-3', name: 'Combustion Analysis Practical', type: 'Practical', delivery: 'In-Person' },
          { id: 'ga2-4', name: 'Combustion Assessment', type: 'Exam', delivery: 'Online' },
        ],
      },
      {
        id: 'gs3', order: 3, courseName: 'Domestic Appliance Installation',
        price: 900, durationHours: 13, durationMinutes: 0,
        revenueRecognition: 0, exposedRefund: 0, isSellable: true, isCommissionable: true,
        activities: [
          { id: 'ga3-1', name: 'Boiler Installation Procedures', type: 'Practical', delivery: 'In-Person' },
          { id: 'ga3-2', name: 'Appliance Commissioning', type: 'Webinar', delivery: 'Online' },
          { id: 'ga3-3', name: 'Installation Assessment', type: 'Exam', delivery: 'Online' },
        ],
      },
      {
        id: 'gs4', order: 4, courseName: 'Central Heating Systems',
        price: 0, durationHours: 12, durationMinutes: 0,
        revenueRecognition: 0, exposedRefund: 0, isSellable: true, isCommissionable: true,
        activities: [
          { id: 'ga4-1', name: 'Heating System Design', type: 'Reading', delivery: 'Online' },
          { id: 'ga4-2', name: 'Pump & Controls Workshop', type: 'Practical', delivery: 'In-Person' },
          { id: 'ga4-3', name: 'Heating Systems Assessment', type: 'Exam', delivery: 'Online' },
        ],
      },
      {
        id: 'gs5', order: 5, courseName: 'Gas Emergency Procedures',
        price: 0, durationHours: 9, durationMinutes: 45,
        revenueRecognition: 0, exposedRefund: 0, isSellable: true, isCommissionable: true,
        activities: [
          { id: 'ga5-1', name: 'Emergency Response Procedures', type: 'Webinar', delivery: 'Online' },
          { id: 'ga5-2', name: 'Gas Leak Response Drill', type: 'Practical', delivery: 'In-Person' },
          { id: 'ga5-3', name: 'Emergency Procedures Exam', type: 'Exam', delivery: 'Online' },
        ],
      },
      {
        id: 'gs6', order: 6, courseName: 'Gas Pipework & Tightness Testing',
        price: 0, durationHours: 7, durationMinutes: 0,
        revenueRecognition: 0, exposedRefund: 0, isSellable: true, isCommissionable: true,
        activities: [
          { id: 'ga6-1', name: 'Pipework Installation', type: 'Practical', delivery: 'In-Person' },
          { id: 'ga6-2', name: 'Tightness Testing Workshop', type: 'Webinar', delivery: 'Online' },
          { id: 'ga6-3', name: 'Pipework Assessment', type: 'Exam', delivery: 'Online' },
        ],
      },
      {
        id: 'gs7', order: 7, courseName: 'CCN1 Exam Preparation',
        price: 0, durationHours: 16, durationMinutes: 0,
        revenueRecognition: 0, exposedRefund: 0, isSellable: true, isCommissionable: true,
        activities: [
          { id: 'ga7-1', name: 'Mock Exam Practice', type: 'Exam', delivery: 'Online' },
          { id: 'ga7-2', name: 'Revision Workshop', type: 'Webinar', delivery: 'Online' },
          { id: 'ga7-3', name: 'CCN1 Final Assessment', type: 'Exam', delivery: 'Online' },
        ],
      },
    ],
  },
  {
    id: 'pkg-plumbing-heating',
    name: 'Plumbing & Heating Package',
    description: 'Full plumbing qualification covering domestic systems, drainage and heating installations',
    trade: 'Plumbing',
    status: 'Pending',
    digitalAccessPercent: 0,
    totalPrice: 0,
    isReadyToSell: false,
    courseCount: 3,
    moduleCount: 7,
    webinarCount: 6,
    assessmentCount: 5,
    totalDurationHours: 58,
    totalDurationMinutes: 0,
    lastUpdated: '2026-02-05',
    stages: [
      {
        id: 'ps1', order: 1, courseName: 'Plumbing Fundamentals',
        price: 0, durationHours: 7, durationMinutes: 0,
        revenueRecognition: 0, exposedRefund: 0, isSellable: true, isCommissionable: true,
        activities: [
          { id: 'pa1-1', name: 'Water Regulations Overview', type: 'Webinar', delivery: 'Online' },
          { id: 'pa1-2', name: 'Pipe Jointing Practical', type: 'Practical', delivery: 'In-Person' },
          { id: 'pa1-3', name: 'Plumbing Fundamentals Exam', type: 'Exam', delivery: 'Online' },
        ],
      },
      {
        id: 'ps2', order: 2, courseName: 'Cold & Hot Water Systems',
        price: 0, durationHours: 9, durationMinutes: 0,
        revenueRecognition: 0, exposedRefund: 0, isSellable: true, isCommissionable: true,
        activities: [
          { id: 'pa2-1', name: 'Cold Water Storage Systems', type: 'Video', delivery: 'Online' },
          { id: 'pa2-2', name: 'Hot Water Cylinder Installation', type: 'Practical', delivery: 'In-Person' },
          { id: 'pa2-3', name: 'Water Systems Assessment', type: 'Exam', delivery: 'Online' },
        ],
      },
      {
        id: 'ps3', order: 3, courseName: 'Drainage & Sanitation',
        price: 0, durationHours: 10, durationMinutes: 0,
        revenueRecognition: 0, exposedRefund: 0, isSellable: true, isCommissionable: true,
        activities: [
          { id: 'pa3-1', name: 'Drainage System Design', type: 'Reading', delivery: 'Online' },
          { id: 'pa3-2', name: 'Sanitation Installation Workshop', type: 'Practical', delivery: 'In-Person' },
          { id: 'pa3-3', name: 'Drainage Assessment', type: 'Exam', delivery: 'Online' },
        ],
      },
      {
        id: 'ps4', order: 4, courseName: 'Bathroom & Wetroom Installations',
        price: 0, durationHours: 11, durationMinutes: 0,
        revenueRecognition: 0, exposedRefund: 0, isSellable: true, isCommissionable: true,
        activities: [
          { id: 'pa4-1', name: 'Bathroom Suite Installation', type: 'Practical', delivery: 'In-Person' },
          { id: 'pa4-2', name: 'Wetroom Waterproofing', type: 'Webinar', delivery: 'Online' },
          { id: 'pa4-3', name: 'Bathroom Installation Exam', type: 'Exam', delivery: 'Online' },
        ],
      },
      {
        id: 'ps5', order: 5, courseName: 'Heating System Installation',
        price: 0, durationHours: 10, durationMinutes: 0,
        revenueRecognition: 0, exposedRefund: 0, isSellable: true, isCommissionable: true,
        activities: [
          { id: 'pa5-1', name: 'Radiator & Underfloor Heating', type: 'Webinar', delivery: 'Online' },
          { id: 'pa5-2', name: 'Heating Installation Practical', type: 'Practical', delivery: 'In-Person' },
          { id: 'pa5-3', name: 'Heating Assessment', type: 'Exam', delivery: 'Online' },
        ],
      },
      {
        id: 'ps6', order: 6, courseName: 'Commercial Plumbing & Maintenance',
        price: 0, durationHours: 11, durationMinutes: 0,
        revenueRecognition: 0, exposedRefund: 0, isSellable: true, isCommissionable: true,
        activities: [
          { id: 'pa6-1', name: 'Legionella Risk Management', type: 'Reading', delivery: 'Online' },
          { id: 'pa6-2', name: 'Commercial Systems Overview', type: 'Webinar', delivery: 'Online' },
          { id: 'pa6-3', name: 'Commercial Plumbing Exam', type: 'Exam', delivery: 'Online' },
        ],
      },
    ],
  },
];
