// prisma/seed.ts (CORREGIDO)
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from 'bcryptjs';
import dotenv from "dotenv";
dotenv.config();


if (!process.env.ADMIN_EMAIL) {
  throw new Error("ADMIN EMAIL is not defined");
}

if (!process.env.ADMIN_PASS) {
  throw new Error("ADMIN PASS is not defined");
}

if (!process.env.ADMIN_ROLE) {
  throw new Error("2 ADMIN EMAIL is not defined");
}

if (!process.env.ADMIN_NAME) {
  throw new Error("ADMIN EMAIL is not defined");
}

if (!process.env.SECOND_ADMIN_EMAIL) {
  throw new Error("2 ADMIN EMAIL is not defined");
}

if (!process.env.SECOND_ADMIN_PASS) {
  throw new Error("ADMIN EMAIL is not defined");
}

if (!process.env.SECOND_ADMIN_ROLE) {
  throw new Error("2 ADMIN EMAIL is not defined");
}

if (!process.env.SECOND_ADMIN_NAME) {
  throw new Error("ADMIN EMAIL is not defined");
}


export interface CourseData {
  id: number;
  name: string;
  abbr: string;
  imo_no: string | null; // <--- ADDED IMO_NO TO INTERFACE
  price_panamanian: number | null;
  price_panamanian_renewal: number | null;
  price_foreign: number | null;
  price_foreign_renewal: number | null;
}

export const courses: CourseData[] = [
  {
    id: 1,
    name: "Basic Training For Oil And Chemical Tanker Cargo Operations",
    abbr: "BTOCT",
    imo_no: "1.01",
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 400,
    price_foreign_renewal: 200,
  },
  {
    id: 2,
    name: "Advanced Training For Liquefied Gas Tanker Cargo Operations",
    abbr: "ATGT",
    imo_no: "1.05",
    price_panamanian: 300,
    price_panamanian_renewal: 150,
    price_foreign: 500,
    price_foreign_renewal: 250,
  },
  {
    id: 3,
    name: "Advanced Training In Fire Fighting",
    abbr: "AFF",
    imo_no: "2.03",
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 300,
    price_foreign_renewal: 150,
  },
  {
    id: 4,
    name: "Ship Security Officer",
    abbr: "SSO",
    imo_no: "3.19",
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 300,
    price_foreign_renewal: 150,
  },
  {
    id: 5,
    name: "Company Security Officer",
    abbr: "CSO",
    imo_no: "3.20",
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 300,
    price_foreign_renewal: 150,
  },
  {
    id: 6,
    name: "Port Facility Security Officer",
    abbr: "PFSO",
    imo_no: "3.21",
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 300,
    price_foreign_renewal: 150,
  },
  {
    id: 7,
    name: "Basic Training For Liquefied Gas Tanker Cargo Operations",
    abbr: "BTGT",
    imo_no: "1.04",
    price_panamanian: 300,
    price_panamanian_renewal: 150,
    price_foreign: 400,
    price_foreign_renewal: 200,
  },
  {
    id: 8,
    name: "Dangerous, Hazardous And Harmful Cargoes",
    abbr: "IMDG",
    imo_no: "1.10",
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 400,
    price_foreign_renewal: 200,
  },
  {
    id: 9,
    name: "Fast Rescue Boats",
    abbr: "FRB",
    imo_no: "1.24",
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 300,
    price_foreign_renewal: 150,
  },
  {
    id: 10,
    name: "Proficiency in Crisis Management and Human Behavior Training",
    abbr: "CMHB",
    imo_no: "1.29",
    price_panamanian: 70,
    price_panamanian_renewal: 35,
    price_foreign: 80,
    price_foreign_renewal: 40,
  },
  {
    id: 11,
    name: "Automatic Identification System",
    abbr: "AIS",
    imo_no: "1.34",
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 300,
    price_foreign_renewal: 150,
  },
  {
    id: 12,
    name: "Engine Room Simulator",
    abbr: "ERS",
    imo_no: "2.07",
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 400,
    price_foreign_renewal: 150,
  },
  {
    id: 13,
    name: "Security Awareness Training For All Port Facility Personnel",
    abbr: "SAPFP",
    imo_no: "3.25",
    price_panamanian: 90,
    price_panamanian_renewal: 45,
    price_foreign: 100,
    price_foreign_renewal: 50,
  },
  {
    id: 14,
    name: "Security Awareness Training For Port Facility Personnel With Designated Security Duties",
    abbr: "SAPFD",
    imo_no: "3.24",
    price_panamanian: 90,
    price_panamanian_renewal: 45,
    price_foreign: 100,
    price_foreign_renewal: 50,
  },
  {
    id: 15,
    name: "Security Training For Seafarers With Designated Security Duties",
    abbr: "STSD",
    imo_no: "3.26",
    price_panamanian: 90,
    price_panamanian_renewal: 45,
    price_foreign: 100,
    price_foreign_renewal: 50,
  },
  {
    id: 16,
    name: "Security Awareness Training For All Seafarers",
    abbr: "SATS",
    imo_no: "3.27",
    price_panamanian: 90,
    price_panamanian_renewal: 45,
    price_foreign: 100,
    price_foreign_renewal: 50,
  },
  {
    id: 17,
    name: "Training Course for Instructors",
    abbr: "TTT",
    imo_no: "6.09",
    price_panamanian: 300,
    price_panamanian_renewal: 150,
    price_foreign: 500,
    price_foreign_renewal: 250,
  },
  {
    id: 18,
    name: "Train The Simulator Trainer And Assessor",
    abbr: "TTS",
    imo_no: "6.10",
    price_panamanian: 300,
    price_panamanian_renewal: 300,
    price_foreign: 400,
    price_foreign_renewal: 400,
  },
  {
    id: 19,
    name: "Bridge Resources Management",
    abbr: "BRM",
    imo_no: "",
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 400,
    price_foreign_renewal: 200,
  },
  {
    id: 20,
    name: "Engine Room Resources Management",
    abbr: "ERRM",
    imo_no: "",
    price_panamanian: 200,
    price_panamanian_renewal: 150,
    price_foreign: 400,
    price_foreign_renewal: 200,
  },
  {
    id: 21,
    name: "Updating Course For Chief Engineer And Second Engineer (First Engineer Officer) on ships of propulsive Power more than 3000 KW (Management Level)",
    abbr: "UCE",
    imo_no: "7.02",
    price_panamanian: 600,
    price_panamanian_renewal: 800,
    price_foreign: 800,
    price_foreign_renewal: 600,
  },
  {
    id: 22,
    name: "Ship's Cook according to MLC, 2006",
    abbr: "COOK",
    imo_no: "",
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 200,
    price_foreign_renewal: 150,
  },
  {
    id: 23,
    name: "Personal Safety And Social Responsibilities",
    abbr: "PSSR",
    imo_no: "1.21",
    price_panamanian: 70,
    price_panamanian_renewal: 35,
    price_foreign: 80,
    price_foreign_renewal: 40,
  },
  {
    id: 24,
    name: "Marine Environmental Awareness",
    abbr: "MEA",
    imo_no: "1.38",
    price_panamanian: 100,
    price_panamanian_renewal: 50,
    price_foreign: 300,
    price_foreign_renewal: 150,
  },
  {
    id: 25,
    name: "Leadership And Teamwork",
    abbr: "LEA",
    imo_no: "1.39",
    price_panamanian: 150,
    price_panamanian_renewal: 75,
    price_foreign: 400,
    price_foreign_renewal: 200,
  },
  {
    id: 26,
    name: "Survival Craft And Rescue Boats other than Fast Rescue Boat",
    abbr: "SCRB",
    imo_no: "1.23",
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 300,
    price_foreign_renewal: 150,
  },
  {
    id: 27,
    name: "Radar Navigation, Radar Plotting and use of ARPA (Operational Level)",
    abbr: "RADAR",
    imo_no: "1.07",
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 300,
    price_foreign_renewal: 150,
  },
  {
    id: 28,
    name: "Updating Course for Officer in Charge of a Navigational Watch on Ships of 500 Gross Tonnage or more (Operational Level)",
    abbr: "UDO",
    imo_no: "7.03",
    price_panamanian: 600,
    price_panamanian_renewal: 600,
    price_foreign: 600,
    price_foreign_renewal: 600,
  },
  {
    id: 29,
    name: "Medical First Aid",
    abbr: "MFA",
    imo_no: "1.14",
    price_panamanian: 300,
    price_panamanian_renewal: 150,
    price_foreign: 400,
    price_foreign_renewal: 200,
  },
  {
    id: 30,
    name: "Advanced Training For Oil Tanker Cargo Operations",
    abbr: "ATOT",
    imo_no: "1.02",
    price_panamanian: 300,
    price_panamanian_renewal: 150,
    price_foreign: 500,
    price_foreign_renewal: 250,
  },
  {
    id: 31,
    name: "Advanced Training For Chemical Tanker Cargo Operations",
    abbr: "ATCT",
    imo_no: "1.03",
    price_panamanian: 300,
    price_panamanian_renewal: 150,
    price_foreign: 500,
    price_foreign_renewal: 250,
  },
  {
    id: 32,
    name: "Medical Care",
    abbr: "MC",
    imo_no: "1.15",
    price_panamanian: 400,
    price_panamanian_renewal: 200,
    price_foreign: 500,
    price_foreign_renewal: 250,
  },
  {
    id: 33,
    name: "Radar, ARPA, Bridge Teamwork and Search and Rescue (Management Level)",
    abbr: "ARPA",
    imo_no: "1.08",
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 300,
    price_foreign_renewal: 150,
  },
  {
    id: 34,
    name: "Ship Simulator And Bridge Teamwork",
    abbr: "BTM",
    imo_no: "1.22",
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 400,
    price_foreign_renewal: 200,
  },
  {
    id: 35,
    name: "General Operator Certificate for GMDSS",
    abbr: "GMDSS",
    imo_no: "1.25",
    price_panamanian: 300,
    price_panamanian_renewal: 150,
    price_foreign: 500,
    price_foreign_renewal: 250,
  },
  {
    id: 36,
    name: "Able Seafarer Engine",
    abbr: "ASE",
    imo_no: "",
    price_panamanian: 300,
    price_panamanian_renewal: 150,
    price_foreign: 400,
    price_foreign_renewal: 200,
  },
  {
    id: 37,
    name: "Ratings Forming Part of a Navigational Watch",
    abbr: "WDR",
    imo_no: "",
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 300,
    price_foreign_renewal: 150,
  },
  {
    id: 38,
    name: "Ratings Forming Part Of an Engineering Watch",
    abbr: "WER",
    imo_no: "",
    price_panamanian: 300,
    price_panamanian_renewal: 150,
    price_foreign: 300,
    price_foreign_renewal: 150,
  },
  {
    id: 39,
    name: "Able Seafarer for Deck",
    abbr: "ASD",
    imo_no: "",
    price_panamanian: 300,
    price_panamanian_renewal: 150,
    price_foreign: 400,
    price_foreign_renewal: 250,
  },
  {
    id: 40,
    name: "Crowd Management, Passenger Safety and Safety Training for Personnel Providing Direct Services to Passengers in Passengers Spaces",
    abbr: "CM",
    imo_no: "1.28",
    price_panamanian: 70,
    price_panamanian_renewal: 35,
    price_foreign: 80,
    price_foreign_renewal: 40,
  },
  {
    id: 41,
    name: "Updating Course For Master And Chief Mate on Ships of 500 Gross Tonnage or more (Management Level)",
    abbr: "UCM",
    imo_no: "7.01",
    price_panamanian: 600,
    price_panamanian_renewal: 600,
    price_foreign: 600,
    price_foreign_renewal: 600,
  },
  {
    id: 42,
    name: "Master and Chief Mate on Ships of 500 Gross Tonnage or more.",
    abbr: "UPCM",
    imo_no: "7.01",
    price_panamanian: 800,
    price_panamanian_renewal: 600,
    price_foreign: 1000,
    price_foreign_renewal: 600,
  },
  {
    id: 43,
    name: "Updating Course For Officer In Charge of An Engineering Watch in a manned engine-room or as designated duty engineers in a periodically unmanned engine-room.",
    abbr: "UEO",
    imo_no: "7.04",
    price_panamanian: 600,
    price_panamanian_renewal: 600,
    price_foreign: 600,
    price_foreign_renewal: 600,
  },
  {
    id: 44,
    name: "Upgrading for Chief Engineer And Second Engineer (First Engineer Officer) on ships of propulsive Power more than 3000 KW (Management Level)",
    abbr: "UPSE",
    imo_no: "7.02",
    price_panamanian: 800,
    price_panamanian_renewal: 500,
    price_foreign: 1600,
    price_foreign_renewal: 800,
  },
  {
    id: 45,
    name: "Personal Survival Techniques",
    abbr: "BPS",
    imo_no: "1.19",
    price_panamanian: 70,
    price_panamanian_renewal: 35,
    price_foreign: 80,
    price_foreign_renewal: 40,
  },
  {
    id: 46,
    name: "Elementary First Aid",
    abbr: "BFA",
    imo_no: "1.13",
    price_panamanian: 70,
    price_panamanian_renewal: 35,
    price_foreign: 80,
    price_foreign_renewal: 40,
  },
  {
    id: 47,
    name: "Yacht Captain",
    abbr: "YPBC_SL",
    imo_no: "",
    price_panamanian: 300,
    price_panamanian_renewal: 150,
    price_foreign: 400,
    price_foreign_renewal: 200,
  },
  {
    id: 48,
    name: "Wiper",
    abbr: "WP",
    imo_no: "",
    price_panamanian: 300,
    price_panamanian_renewal: 300,
    price_foreign: 350,
    price_foreign_renewal: 350,
  },
  {
    id: 49,
    name: "Ordinary Seaman",
    abbr: "OS",
    imo_no: "",
    price_panamanian: 300,
    price_panamanian_renewal: 300,
    price_foreign: 350,
    price_foreign_renewal: 350,
  },
  {
    id: 50,
    name: "Fire Prevention And Fire Fighting",
    abbr: "BFF",
    imo_no: "1.20",
    price_panamanian: 70,
    price_panamanian_renewal: 35,
    price_foreign: 80,
    price_foreign_renewal: 40,
  },
  {
    id: 51,
    name: "The Operational Use of Electronic Chart Display and Information Systems (ECDIS)",
    abbr: "ECDIS",
    imo_no: "1.27",
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 300,
    price_foreign_renewal: 150,
  },
  {
    id: 52,
    name: "Upgrading Course for Officer in Charge of a Navigational Watch on Ships of 500 Gross Tonnage or more (Operational Level)",
    abbr: "OOWD",
    imo_no: "7.03",
    price_panamanian: null,
    price_panamanian_renewal: null,
    price_foreign: null,
    price_foreign_renewal: null,
  },
  {
    id: 53,
    name: "Upgrading Course for Officer in Charge of an Engineering Watch (Operational Level)",
    abbr: "OOWE",
    imo_no: "7.02",
    price_panamanian: null,
    price_panamanian_renewal: null,
    price_foreign: null,
    price_foreign_renewal: null,
  },
  {
    id: 56,
    name: "Seguridad Maritima Para Aguas Nacionales",
    abbr: "SMAN",
    imo_no: null,
    price_panamanian: 100,
    price_panamanian_renewal: 100,
    price_foreign: 250,
    price_foreign_renewal: 125,
  },
  {
    id: 57,
    name: "Patron de Naves de Placer de 1era Clase",
    abbr: "PNP1",
    imo_no: null,
    price_panamanian: 300,
    price_panamanian_renewal: 150,
    price_foreign: 300,
    price_foreign_renewal: 150,
  },
  {
    id: 58,
    name: "Patron de Naves de Placer de 2da Clase",
    abbr: "PNP2",
    imo_no: null,
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 200,
    price_foreign_renewal: 100,
  },
  {
    id: 59,
    name: "Patron de Naves de Placer de 3ra Clase",
    abbr: "PNP3",
    imo_no: null,
    price_panamanian: 150,
    price_panamanian_renewal: 75,
    price_foreign: 150,
    price_foreign_renewal: 75,
  },
  {
    id: 60,
    name: "Patron de Cabotaje Hasta 100 GRT",
    abbr: "PC100",
    imo_no: null,
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 200,
    price_foreign_renewal: 100,
  },
  {
    id: 61,
    name: "Patron de Cabotaje hasta 500 GRT",
    abbr: "PC500",
    imo_no: null,
    price_panamanian: 300,
    price_panamanian_renewal: 150,
    price_foreign: 300,
    price_foreign_renewal: 150,
  },
  {
    id: 62,
    name: "Patron de Pesca de 1era Clase",
    abbr: "PP1",
    imo_no: null,
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 200,
    price_foreign_renewal: 100,
  },
  {
    id: 63,
    name: "Basic Safety Training Courses",
    abbr: "BST",
    imo_no: "",
    price_panamanian: 320,
    price_panamanian_renewal: 320,
    price_foreign: 320,
    price_foreign_renewal: 320,
  },
  {
    id: 64,
    name: "Designated Person Ashore",
    abbr: "DPA",
    imo_no: null,
    price_panamanian: 300,
    price_panamanian_renewal: 300,
    price_foreign: 300,
    price_foreign_renewal: 300,
  },
  {
    id: 65,
    name: "High Voltage Installations Operational level",
    abbr: "VOLT",
    imo_no: "",
    price_panamanian: 300,
    price_panamanian_renewal: 150,
    price_foreign: 400,
    price_foreign_renewal: 300,
  },
  {
    id: 66,
    name: "Passenger Ship Crisis Management and Human Behaviour Training",
    abbr: "CMHBT",
    imo_no: "1.42",
    price_panamanian: 70,
    price_panamanian_renewal: 35,
    price_foreign: 80,
    price_foreign_renewal: 40,
  },
  {
    id: 67,
    name: "Passenger Ship Crowd Management Training",
    abbr: "CMT",
    imo_no: "1.41",
    price_panamanian: 70,
    price_panamanian_renewal: 30,
    price_foreign: 80,
    price_foreign_renewal: 40,
  },
  {
    id: 69,
    name: "Passenger Safety, Cargo Safety and Hull Integrity Training",
    abbr: "PSCSHIT",
    imo_no: "",
    price_panamanian: 300,
    price_panamanian_renewal: 300,
    price_foreign: 400,
    price_foreign_renewal: 400,
  },
  {
    id: 70,
    name: "Safety Training for Personnel Providing Direct Service to Passengers in Passenger Spaces",
    abbr: "SPPS",
    imo_no: "",
    price_panamanian: 70,
    price_panamanian_renewal: 40,
    price_foreign: 80,
    price_foreign_renewal: 40,
  },
  {
    id: 71,
    name: "Use of Leadership and Managerial Skills",
    abbr: "LEMS",
    imo_no: "1.40",
    price_panamanian: 400,
    price_panamanian_renewal: 200,
    price_foreign: 500,
    price_foreign_renewal: 250,
  },
  {
    id: 72,
    name: "Training Course for Assessment, Examination and Certification of Seafarers",
    abbr: "AECS",
    imo_no: "3.12",
    price_panamanian: 400,
    price_panamanian_renewal: null,
    price_foreign: 400,
    price_foreign_renewal: null,
  },
  {
    id: 73,
    name: "Chief Engineer and Second Engineer (First Engineer Officer) On Ships of Propulsive Power more than 3000 KW (Management Level) - Refresher Course",
    abbr: "REF-UCE",
    imo_no: "",
    price_panamanian: 800,
    price_panamanian_renewal: null,
    price_foreign: 1000,
    price_foreign_renewal: null,
  },
  {
    id: 75,
    name: "Previous Documentation Evaluation",
    abbr: "PDE",
    imo_no: null,
    price_panamanian: null,
    price_panamanian_renewal: null,
    price_foreign: null,
    price_foreign_renewal: null,
  },
  {
    id: 76,
    name: "High Voltage Installations Management Level",
    abbr: "VOLT-MG",
    imo_no: "",
    price_panamanian: 400,
    price_panamanian_renewal: 200,
    price_foreign: 400,
    price_foreign_renewal: 200,
  },
  {
    id: 77,
    name: "Personal Safety And Social Responsibilities - Refresher Course",
    abbr: "REF-PSSR",
    imo_no: "1.21",
    price_panamanian: 70,
    price_panamanian_renewal: 35,
    price_foreign: 80,
    price_foreign_renewal: 40,
  },
  {
    id: 78,
    name: "Fire Prevention And Fire Fighting - Refresher Course",
    abbr: "REF-BFF",
    imo_no: "1.20",
    price_panamanian: 70,
    price_panamanian_renewal: 35,
    price_foreign: 80,
    price_foreign_renewal: 40,
  },
  {
    id: 79,
    name: "Personal Survival Techniques - Refresher Course",
    abbr: "REF-BPS",
    imo_no: "1.19",
    price_panamanian: 70,
    price_panamanian_renewal: 35,
    price_foreign: 80,
    price_foreign_renewal: 40,
  },
  {
    id: 80,
    name: "Elementary First Aid - Refresher Course",
    abbr: "REF-BFA",
    imo_no: "1.13",
    price_panamanian: 70,
    price_panamanian_renewal: 35,
    price_foreign: 80,
    price_foreign_renewal: 40,
  },
  {
    id: 86,
    name: "Radar Navigation, Radar Plotting and use of ARPA (Operational Level) - Refresher Course",
    abbr: "REF-RADAR",
    imo_no: "1.07",
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 300,
    price_foreign_renewal: 150,
  },
  {
    id: 87,
    name: "Radar, ARPA, Bridge Teamwork and Search and Rescue (Management Level) - Refresher Course",
    abbr: "REF-ARPA",
    imo_no: "1.08",
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 300,
    price_foreign_renewal: 150,
  },
  {
    id: 88,
    name: "Advanced Training For Oil Tanker Cargo Operations - Refresher Course",
    abbr: "REF-ATOT",
    imo_no: "1.02",
    price_panamanian: 300,
    price_panamanian_renewal: 150,
    price_foreign: 500,
    price_foreign_renewal: 250,
  },
  {
    id: 89,
    name: "Survival Craft And Rescue Boats other than Fast Rescue Boat - Refresher Course",
    abbr: "REF-SCRB",
    imo_no: "1.23",
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 300,
    price_foreign_renewal: 150,
  },
  {
    id: 90,
    name: "Ship Security Officer - Refresher Course",
    abbr: "REF-SSO",
    imo_no: "3.19",
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 300,
    price_foreign_renewal: 150,
  },
  {
    id: 84,
    name: "Ratings Forming Part of a Navigational Watch - Refresher Course",
    abbr: "REF-WDR",
    imo_no: "",
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 300,
    price_foreign_renewal: 150,
  },
  {
    id: 91,
    name: "Ratings Forming Part Of an Engineering Watch - Refresher Course",
    abbr: "REF-WER",
    imo_no: "",
    price_panamanian: 300,
    price_panamanian_renewal: 150,
    price_foreign: 300,
    price_foreign_renewal: 150,
  },
  {
    id: 92,
    name: "Medical Care - Refresher Course",
    abbr: "REF-MC",
    imo_no: "1.15",
    price_panamanian: 400,
    price_panamanian_renewal: 200,
    price_foreign: 500,
    price_foreign_renewal: 250,
  },
  {
    id: 93,
    name: "Advanced Training In Fire Fighting - Refresher Course",
    abbr: "REF-AFF",
    imo_no: "2.03",
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 300,
    price_foreign_renewal: 150,
  },
  {
    id: 94,
    name: "Basic Training For Oil And Chemical Tanker Cargo Operations - Refresher Course",
    abbr: "REF-BTOCT",
    imo_no: "1.01",
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 400,
    price_foreign_renewal: 200,
  },
  {
    id: 95,
    name: "The Operational Use of Electronic Chart Display and Information Systems (ECDIS) - Refresher Course",
    abbr: "REF-ECDIS",
    imo_no: "1.27",
    price_panamanian: 200,
    price_panamanian_renewal: 100,
    price_foreign: 300,
    price_foreign_renewal: 150,
  },
];

export interface InstructorData {
  id: number;
  name: string;
}

export const instructorsData: InstructorData[] = [
  {
    id: 1,
    name: "Billy Oro",
  },
  {
    id: 2,
    name: "Cesar Reyes",
  },
  {
    id: 3,
    name: "Hector Mojica",
  },
  {
    id: 4,
    name: "Juan C. Caballero",
  },
  {
    id: 5,
    name: "Moises Torrijos",
  },
  {
    id: 6,
    name: "Agustin Gonzalez",
  },
  {
    id: 7,
    name: "Ariel Buddle",
  },
  {
    id: 8,
    name: "Carolina Garay",
  },
  {
    id: 9,
    name: "Javier Diaz",
  },
  {
    id: 10,
    name: "Eric Atencio",
  },
  {
    id: 11,
    name: "Celeste Cinus",
  },
  {
    id: 12,
    name: "Zabdiel Lozada",
  },
  {
    id: 13,
    name: "Luis Carlos Botacio",
  },
  {
    id: 14,
    name: "Michelle Mendoza",
  },
  {
    id: 15,
    name: "Karen Otero",
  },
  {
    id: 16,
    name: "Jairo Rondon",
  },
  {
    id: 17,
    name: "Joel Romero",
  },
  {
    id: 18,
    name: "Bryan Chang",
  },
  {
    id: 19,
    name: "Alcides Montemayor",
  },
  {
    id: 20,
    name: "Sergio Sanchez",
  },
  {
    id: 21,
    name: "Lubin Gutierrez",
  },
  {
    id: 22,
    name: "Elias Berrocal",
  },
  {
    id: 23,
    name: "Rene Acuña",
  },
  {
    id: 24,
    name: "Rene Vergara",
  },
];

const prisma = new PrismaClient();

// --- COPIA Y REEMPLAZA ESTA FUNCIÓN main() EN TU ARCHIVO ---

async function main() {
  console.log(`Iniciando el proceso de siembra...`);
  const hashedPassword = await bcrypt.hash(`${process.env.ADMIN_PASS}`, 10);

  console.log("Seeding admin users...");

  await prisma.user.createMany({
    data: [
      {
        email: `${process.env.ADMIN_EMAIL}`,
        password: hashedPassword,
        name: `${process.env.ADMIN_NAME}`,
        role: (process.env.ADMIN_ROLE as Role) || "CLIENT",
      },
      {
        email: `${process.env.SECOND_ADMIN_EMAIL}`,
        password: hashedPassword,
        name: `${process.env.SECOND_ADMIN_NAME}`,
        role: (process.env.ADMIN_ROLE as Role) || "CLIENT",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Admin users seeded successfully!");
  await prisma.quote.deleteMany({});
  console.log(`Registros de cotizaciones existentes eliminados.`);

  await prisma.evaluation.deleteMany({});
  console.log(`Registros de evaluaciones existentes eliminados.`);

  await prisma.course.deleteMany({});
  console.log(`Registros de cursos existentes eliminados.`);

  await prisma.instructor.deleteMany({});
  console.log(`Registros de instructores existentes eliminados.`);

  console.log(`Sembrando cursos...`);
  for (const courseData of courses) {
    const course = await prisma.course.create({
      data: {
        // Tu mapeo de camelCase vs snake_case ya estaba correcto aquí.
        name: courseData.name,
        abbr: courseData.abbr,
        imo_no: courseData.imo_no,
        price_panamanian: courseData.price_panamanian ?? undefined,
        price_panamanian_renewal:
          courseData.price_panamanian_renewal ?? undefined,
        price_foreign: courseData.price_foreign ?? undefined,
        price_foreign_renewal: courseData.price_foreign_renewal ?? undefined,
      },
    });
    // Nota: El `id` de tu archivo de datos se ignora, Prisma usará el autoincremento, lo cual es correcto.
  }
  console.log(`Siembra de cursos finalizada.`);

  // --- Siembra de Instructores ---
  console.log(`Sembrando instructores...`);
  for (const instructor of instructorsData) {
    await prisma.instructor.create({
      data: {
        name: instructor.name,
      },
    });
  }
  console.log(`Siembra de instructores finalizada.`);

  console.log(`Todas las operaciones de siembra completadas.`);
}

main()
  .catch((e) => {
    console.error("Ocurrió un error durante la ejecución del seed:");
    // Esto te dará un error más descriptivo si es un error de Prisma
    if (e.code) {
      console.error(`Error de Prisma (${e.code}):`, e.message);
      if (e.meta) {
        console.error("Detalles:", e.meta);
      }
    } else {
      console.error(e);
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("Desconectado de la base de datos.");
  });
