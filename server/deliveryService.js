import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Built-in dataset as zero-dependency backup for isolated serverless environments
const STATIC_DELIVERY_DATASET = [
  { Order_ID: 1, User_ID: 'U3522', Item_Name: 'Fried Chicken', Quantity: '3', Total_Price: '273.72', Order_Time: '2025-06-16 08:32:00', Delivery_Time: '2025-06-16 09:11:00', Delivery_Duration_Minutes: '39', City: 'Alexandria', Order_Status: 'Delivered', Driver_Vehicle: 'Motorbike', Traffic_Level: 'High' },
  { Order_ID: 2, User_ID: 'U9214', Item_Name: 'Sandwich', Quantity: '3', Total_Price: '365.82', Order_Time: '2025-06-03 21:27:00', Delivery_Time: '2025-06-03 22:00:00', Delivery_Duration_Minutes: '33', City: 'Zagazig', Order_Status: 'Delivered', Driver_Vehicle: 'Motorbike', Traffic_Level: 'Low' },
  { Order_ID: 3, User_ID: 'U7307', Item_Name: 'Koshary', Quantity: '3', Total_Price: '401.94', Order_Time: '2025-06-01 14:48:00', Delivery_Time: '2025-06-01 15:26:00', Delivery_Duration_Minutes: '38', City: 'Assiut', Order_Status: 'In Transit', Driver_Vehicle: 'Car', Traffic_Level: 'Medium' },
  { Order_ID: 4, User_ID: 'U3612', Item_Name: 'Sushi', Quantity: '2', Total_Price: '221.18', Order_Time: '2025-06-13 02:30:00', Delivery_Time: '2025-06-13 03:22:00', Delivery_Duration_Minutes: '52', City: 'Mansoura', Order_Status: 'Delivered', Driver_Vehicle: 'Car', Traffic_Level: 'Low' },
  { Order_ID: 5, User_ID: 'U3492', Item_Name: 'Koshary', Quantity: '5', Total_Price: '355.55', Order_Time: '2025-06-06 09:48:00', Delivery_Time: '2025-06-06 10:32:00', Delivery_Duration_Minutes: '44', City: 'Mansoura', Order_Status: 'Delivered', Driver_Vehicle: 'Motorbike', Traffic_Level: 'High' },
  { Order_ID: 6, User_ID: 'U7439', Item_Name: 'Sushi', Quantity: '3', Total_Price: '205.44', Order_Time: '2025-06-04 12:16:00', Delivery_Time: '2025-06-04 12:45:00', Delivery_Duration_Minutes: '29', City: 'Mansoura', Order_Status: 'Delivered', Driver_Vehicle: 'Bicycle', Traffic_Level: 'Medium' },
  { Order_ID: 7, User_ID: 'U8948', Item_Name: 'Sushi', Quantity: '1', Total_Price: '133.94', Order_Time: '2025-06-11 04:09:00', Delivery_Time: '2025-06-11 04:49:00', Delivery_Duration_Minutes: '40', City: 'Cairo', Order_Status: 'Delivered', Driver_Vehicle: 'Bicycle', Traffic_Level: 'Low' },
  { Order_ID: 8, User_ID: 'U8672', Item_Name: 'Shawarma', Quantity: '5', Total_Price: '404.8', Order_Time: '2025-06-12 18:37:00', Delivery_Time: '2025-06-12 19:18:00', Delivery_Duration_Minutes: '41', City: 'Mansoura', Order_Status: 'Delivered', Driver_Vehicle: 'Bicycle', Traffic_Level: 'High' },
  { Order_ID: 9, User_ID: 'U2205', Item_Name: 'Pizza', Quantity: '1', Total_Price: '101.03', Order_Time: '2025-06-01 22:18:00', Delivery_Time: '2025-06-01 23:05:00', Delivery_Duration_Minutes: '47', City: 'Mansoura', Order_Status: 'Delivered', Driver_Vehicle: 'Motorbike', Traffic_Level: 'Low' },
  { Order_ID: 10, User_ID: 'U7411', Item_Name: 'Pizza', Quantity: '1', Total_Price: '130.05', Order_Time: '2025-06-09 00:18:00', Delivery_Time: '2025-06-09 01:04:00', Delivery_Duration_Minutes: '46', City: 'Cairo', Order_Status: 'Delivered', Driver_Vehicle: 'Bicycle', Traffic_Level: 'Low' },
  { Order_ID: 11, User_ID: 'U7405', Item_Name: 'Sushi', Quantity: '2', Total_Price: '296.24', Order_Time: '2025-06-04 22:11:00', Delivery_Time: '2025-06-04 22:43:00', Delivery_Duration_Minutes: '32', City: 'Assiut', Order_Status: 'Delivered', Driver_Vehicle: 'Car', Traffic_Level: 'Low' },
  { Order_ID: 12, User_ID: 'U8337', Item_Name: 'Burger', Quantity: '1', Total_Price: '111.55', Order_Time: '2025-06-02 16:33:00', Delivery_Time: '2025-06-02 17:04:00', Delivery_Duration_Minutes: '31', City: 'Tanta', Order_Status: 'Delivered', Driver_Vehicle: 'Car', Traffic_Level: 'High' },
  { Order_ID: 13, User_ID: 'U5398', Item_Name: 'Burger', Quantity: '1', Total_Price: '39.45', Order_Time: '2025-06-02 04:17:00', Delivery_Time: '2025-06-02 04:37:00', Delivery_Duration_Minutes: '20', City: 'Giza', Order_Status: 'Cancelled', Driver_Vehicle: 'Bicycle', Traffic_Level: 'Low' },
  { Order_ID: 14, User_ID: 'U9001', Item_Name: 'Sushi', Quantity: '1', Total_Price: '116.96', Order_Time: '2025-06-08 03:35:00', Delivery_Time: '2025-06-08 04:03:00', Delivery_Duration_Minutes: '28', City: 'Tanta', Order_Status: 'Delivered', Driver_Vehicle: 'Bicycle', Traffic_Level: 'Low' },
  { Order_ID: 15, User_ID: 'U8797', Item_Name: 'Burger', Quantity: '4', Total_Price: '562.72', Order_Time: '2025-06-06 13:21:00', Delivery_Time: '2025-06-06 13:57:00', Delivery_Duration_Minutes: '36', City: 'Cairo', Order_Status: 'Cancelled', Driver_Vehicle: 'Motorbike', Traffic_Level: 'Medium' },
  { Order_ID: 16, User_ID: 'U4706', Item_Name: 'Salad', Quantity: '1', Total_Price: '65.31', Order_Time: '2025-06-05 20:23:00', Delivery_Time: '2025-06-05 21:17:00', Delivery_Duration_Minutes: '54', City: 'Alexandria', Order_Status: 'Delivered', Driver_Vehicle: 'Motorbike', Traffic_Level: 'Low' },
  { Order_ID: 17, User_ID: 'U9985', Item_Name: 'Pizza', Quantity: '1', Total_Price: '39.1', Order_Time: '2025-06-14 10:24:00', Delivery_Time: '2025-06-14 11:18:00', Delivery_Duration_Minutes: '54', City: 'Zagazig', Order_Status: 'Delivered', Driver_Vehicle: 'Motorbike', Traffic_Level: 'Medium' },
  { Order_ID: 18, User_ID: 'U2654', Item_Name: 'Koshary', Quantity: '1', Total_Price: '34.94', Order_Time: '2025-06-03 02:34:00', Delivery_Time: '2025-06-03 03:09:00', Delivery_Duration_Minutes: '35', City: 'Alexandria', Order_Status: 'Delivered', Driver_Vehicle: 'Car', Traffic_Level: 'Low' },
  { Order_ID: 19, User_ID: 'U3339', Item_Name: 'Salad', Quantity: '5', Total_Price: '251.0', Order_Time: '2025-06-08 23:17:00', Delivery_Time: '2025-06-08 23:54:00', Delivery_Duration_Minutes: '37', City: 'Assiut', Order_Status: 'Delivered', Driver_Vehicle: 'Motorbike', Traffic_Level: 'Low' },
  { Order_ID: 20, User_ID: 'U4958', Item_Name: 'Shawarma', Quantity: '5', Total_Price: '511.4', Order_Time: '2025-06-15 18:14:00', Delivery_Time: '2025-06-15 18:42:00', Delivery_Duration_Minutes: '28', City: 'Assiut', Order_Status: 'Delivered', Driver_Vehicle: 'Car', Traffic_Level: 'High' },
  { Order_ID: 21, User_ID: 'U4475', Item_Name: 'Sandwich', Quantity: '2', Total_Price: '168.84', Order_Time: '2025-06-12 07:02:00', Delivery_Time: '2025-06-12 07:40:00', Delivery_Duration_Minutes: '38', City: 'Giza', Order_Status: 'Delivered', Driver_Vehicle: 'Motorbike', Traffic_Level: 'High' },
  { Order_ID: 22, User_ID: 'U9036', Item_Name: 'Pizza', Quantity: '4', Total_Price: '316.44', Order_Time: '2025-06-07 14:17:00', Delivery_Time: '2025-06-07 15:02:00', Delivery_Duration_Minutes: '45', City: 'Cairo', Order_Status: 'In Transit', Driver_Vehicle: 'Car', Traffic_Level: 'Medium' },
  { Order_ID: 23, User_ID: 'U5581', Item_Name: 'Sushi', Quantity: '1', Total_Price: '103.71', Order_Time: '2025-06-06 01:02:00', Delivery_Time: '2025-06-06 01:42:00', Delivery_Duration_Minutes: '40', City: 'Alexandria', Order_Status: 'In Transit', Driver_Vehicle: 'Car', Traffic_Level: 'Low' },
  { Order_ID: 24, User_ID: 'U2186', Item_Name: 'Salad', Quantity: '1', Total_Price: '126.03', Order_Time: '2025-06-03 20:43:00', Delivery_Time: '2025-06-03 21:09:00', Delivery_Duration_Minutes: '26', City: 'Assiut', Order_Status: 'Delivered', Driver_Vehicle: 'Motorbike', Traffic_Level: 'Low' },
  { Order_ID: 25, User_ID: 'U1250', Item_Name: 'Shawarma', Quantity: '2', Total_Price: '65.88', Order_Time: '2025-06-08 18:30:00', Delivery_Time: '2025-06-08 19:11:00', Delivery_Duration_Minutes: '41', City: 'Tanta', Order_Status: 'Delivered', Driver_Vehicle: 'Bicycle', Traffic_Level: 'High' },
  { Order_ID: 26, User_ID: 'U9226', Item_Name: 'Shawarma', Quantity: '3', Total_Price: '352.89', Order_Time: '2025-06-03 23:29:00', Delivery_Time: '2025-06-04 00:24:00', Delivery_Duration_Minutes: '55', City: 'Assiut', Order_Status: 'Delivered', Driver_Vehicle: 'Car', Traffic_Level: 'Low' },
  { Order_ID: 27, User_ID: 'U6560', Item_Name: 'Fried Chicken', Quantity: '2', Total_Price: '99.36', Order_Time: '2025-06-05 21:51:00', Delivery_Time: '2025-06-05 22:21:00', Delivery_Duration_Minutes: '30', City: 'Assiut', Order_Status: 'Delivered', Driver_Vehicle: 'Bicycle', Traffic_Level: 'Low' },
  { Order_ID: 28, User_ID: 'U6714', Item_Name: 'Shawarma', Quantity: '4', Total_Price: '473.88', Order_Time: '2025-06-12 14:36:00', Delivery_Time: '2025-06-12 15:23:00', Delivery_Duration_Minutes: '47', City: 'Giza', Order_Status: 'Delivered', Driver_Vehicle: 'Car', Traffic_Level: 'Medium' },
  { Order_ID: 29, User_ID: 'U9034', Item_Name: 'Salad', Quantity: '5', Total_Price: '308.2', Order_Time: '2025-06-06 19:31:00', Delivery_Time: '2025-06-06 20:20:00', Delivery_Duration_Minutes: '49', City: 'Assiut', Order_Status: 'Cancelled', Driver_Vehicle: 'Car', Traffic_Level: 'High' },
  { Order_ID: 30, User_ID: 'U6352', Item_Name: 'Koshary', Quantity: '3', Total_Price: '350.37', Order_Time: '2025-06-02 06:29:00', Delivery_Time: '2025-06-02 07:20:00', Delivery_Duration_Minutes: '51', City: 'Cairo', Order_Status: 'Delivered', Driver_Vehicle: 'Bicycle', Traffic_Level: 'Low' },
  { Order_ID: 31, User_ID: 'U3527', Item_Name: 'Pasta', Quantity: '1', Total_Price: '135.15', Order_Time: '2025-06-10 00:57:00', Delivery_Time: '2025-06-10 01:44:00', Delivery_Duration_Minutes: '47', City: 'Tanta', Order_Status: 'Delivered', Driver_Vehicle: 'Bicycle', Traffic_Level: 'Low' },
  { Order_ID: 32, User_ID: 'U5680', Item_Name: 'Koshary', Quantity: '3', Total_Price: '383.04', Order_Time: '2025-06-07 05:15:00', Delivery_Time: '2025-06-07 05:54:00', Delivery_Duration_Minutes: '39', City: 'Assiut', Order_Status: 'Delivered', Driver_Vehicle: 'Motorbike', Traffic_Level: 'Low' },
  { Order_ID: 33, User_ID: 'U7501', Item_Name: 'Salad', Quantity: '3', Total_Price: '297.96', Order_Time: '2025-06-12 22:50:00', Delivery_Time: '2025-06-12 23:15:00', Delivery_Duration_Minutes: '25', City: 'Alexandria', Order_Status: 'Delivered', Driver_Vehicle: 'Bicycle', Traffic_Level: 'Low' },
  { Order_ID: 34, User_ID: 'U5249', Item_Name: 'Sushi', Quantity: '5', Total_Price: '224.85', Order_Time: '2025-06-02 11:34:00', Delivery_Time: '2025-06-02 12:08:00', Delivery_Duration_Minutes: '34', City: 'Mansoura', Order_Status: 'Delivered', Driver_Vehicle: 'Motorbike', Traffic_Level: 'Medium' },
  { Order_ID: 35, User_ID: 'U2503', Item_Name: 'Pizza', Quantity: '3', Total_Price: '193.32', Order_Time: '2025-06-04 05:35:00', Delivery_Time: '2025-06-04 06:15:00', Delivery_Duration_Minutes: '40', City: 'Assiut', Order_Status: 'Delivered', Driver_Vehicle: 'Car', Traffic_Level: 'Low' },
  { Order_ID: 36, User_ID: 'U2121', Item_Name: 'Koshary', Quantity: '4', Total_Price: '175.92', Order_Time: '2025-06-09 18:56:00', Delivery_Time: '2025-06-09 19:24:00', Delivery_Duration_Minutes: '28', City: 'Zagazig', Order_Status: 'Delivered', Driver_Vehicle: 'Motorbike', Traffic_Level: 'High' },
  { Order_ID: 37, User_ID: 'U8163', Item_Name: 'Pasta', Quantity: '4', Total_Price: '334.44', Order_Time: '2025-06-07 07:00:00', Delivery_Time: '2025-06-07 07:53:00', Delivery_Duration_Minutes: '53', City: 'Giza', Order_Status: 'Delivered', Driver_Vehicle: 'Car', Traffic_Level: 'High' },
  { Order_ID: 38, User_ID: 'U7014', Item_Name: 'Salad', Quantity: '4', Total_Price: '517.08', Order_Time: '2025-06-13 11:44:00', Delivery_Time: '2025-06-13 12:17:00', Delivery_Duration_Minutes: '33', City: 'Mansoura', Order_Status: 'Delivered', Driver_Vehicle: 'Bicycle', Traffic_Level: 'Medium' },
  { Order_ID: 39, User_ID: 'U7194', Item_Name: 'Sushi', Quantity: '3', Total_Price: '358.56', Order_Time: '2025-06-14 10:41:00', Delivery_Time: '2025-06-14 11:15:00', Delivery_Duration_Minutes: '34', City: 'Zagazig', Order_Status: 'In Transit', Driver_Vehicle: 'Car', Traffic_Level: 'Medium' },
  { Order_ID: 40, User_ID: 'U9507', Item_Name: 'Pizza', Quantity: '3', Total_Price: '147.3', Order_Time: '2025-06-01 16:10:00', Delivery_Time: '2025-06-01 16:31:00', Delivery_Duration_Minutes: '21', City: 'Giza', Order_Status: 'Delivered', Driver_Vehicle: 'Car', Traffic_Level: 'High' },
  { Order_ID: 41, User_ID: 'U4192', Item_Name: 'Koshary', Quantity: '3', Total_Price: '97.05', Order_Time: '2025-06-03 02:18:00', Delivery_Time: '2025-06-03 02:52:00', Delivery_Duration_Minutes: '34', City: 'Mansoura', Order_Status: 'Cancelled', Driver_Vehicle: 'Car', Traffic_Level: 'Low' },
  { Order_ID: 42, User_ID: 'U9682', Item_Name: 'Pizza', Quantity: '5', Total_Price: '357.85', Order_Time: '2025-06-02 21:22:00', Delivery_Time: '2025-06-02 22:02:00', Delivery_Duration_Minutes: '40', City: 'Tanta', Order_Status: 'Delivered', Driver_Vehicle: 'Car', Traffic_Level: 'Low' },
  { Order_ID: 43, User_ID: 'U7627', Item_Name: 'Pasta', Quantity: '1', Total_Price: '83.75', Order_Time: '2025-06-12 07:46:00', Delivery_Time: '2025-06-12 08:19:00', Delivery_Duration_Minutes: '33', City: 'Assiut', Order_Status: 'Delivered', Driver_Vehicle: 'Car', Traffic_Level: 'High' },
  { Order_ID: 44, User_ID: 'U4731', Item_Name: 'Shawarma', Quantity: '2', Total_Price: '253.98', Order_Time: '2025-06-03 10:50:00', Delivery_Time: '2025-06-03 11:36:00', Delivery_Duration_Minutes: '46', City: 'Tanta', Order_Status: 'Delivered', Driver_Vehicle: 'Motorbike', Traffic_Level: 'Medium' },
  { Order_ID: 45, User_ID: 'U2786', Item_Name: 'Burger', Quantity: '2', Total_Price: '186.48', Order_Time: '2025-06-12 23:31:00', Delivery_Time: '2025-06-12 23:56:00', Delivery_Duration_Minutes: '25', City: 'Giza', Order_Status: 'Delivered', Driver_Vehicle: 'Car', Traffic_Level: 'Low' },
  { Order_ID: 46, User_ID: 'U2840', Item_Name: 'Koshary', Quantity: '1', Total_Price: '113.28', Order_Time: '2025-06-04 08:20:00', Delivery_Time: '2025-06-04 09:11:00', Delivery_Duration_Minutes: '51', City: 'Zagazig', Order_Status: 'Delivered', Driver_Vehicle: 'Car', Traffic_Level: 'High' },
  { Order_ID: 47, User_ID: 'U6356', Item_Name: 'Shawarma', Quantity: '1', Total_Price: '79.01', Order_Time: '2025-06-07 17:11:00', Delivery_Time: '2025-06-07 17:56:00', Delivery_Duration_Minutes: '45', City: 'Tanta', Order_Status: 'Delivered', Driver_Vehicle: 'Car', Traffic_Level: 'High' },
  { Order_ID: 48, User_ID: 'U6759', Item_Name: 'Fried Chicken', Quantity: '2', Total_Price: '130.8', Order_Time: '2025-06-03 14:05:00', Delivery_Time: '2025-06-03 14:49:00', Delivery_Duration_Minutes: '44', City: 'Assiut', Order_Status: 'Delivered', Driver_Vehicle: 'Motorbike', Traffic_Level: 'Medium' },
  { Order_ID: 49, User_ID: 'U4435', Item_Name: 'Koshary', Quantity: '4', Total_Price: '302.68', Order_Time: '2025-06-06 15:05:00', Delivery_Time: '2025-06-06 15:54:00', Delivery_Duration_Minutes: '49', City: 'Mansoura', Order_Status: 'Delivered', Driver_Vehicle: 'Motorbike', Traffic_Level: 'Medium' },
  { Order_ID: 50, User_ID: 'U2969', Item_Name: 'Shawarma', Quantity: '4', Total_Price: '239.84', Order_Time: '2025-06-06 09:09:00', Delivery_Time: '2025-06-06 10:07:00', Delivery_Duration_Minutes: '58', City: 'Giza', Order_Status: 'Delivered', Driver_Vehicle: 'Motorbike', Traffic_Level: 'High' }
];

let orderMap = new Map();
let orderList = [];

/**
 * Native CSV Parser with zero external dependencies
 */
function parseCSV(content) {
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return { map: new Map(), list: [] };

  const headers = lines[0].split(',').map(h => h.trim());
  const map = new Map();
  const list = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(c => c.trim());
    if (row.length < headers.length) continue;

    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index];
    });

    const orderId = parseInt(record.Order_ID, 10);
    if (!isNaN(orderId)) {
      record.Order_ID = orderId;
      map.set(orderId, record);
      list.push(record);
    }
  }

  return { map, list };
}

/**
 * Ingest talabat_delivery_sample.csv into in-memory array/JSON map
 */
export function initDeliveryService() {
  const possiblePaths = [
    path.resolve(process.cwd(), 'talabat_delivery_sample.csv'),
    path.resolve(__dirname, '../talabat_delivery_sample.csv'),
    path.resolve(__dirname, '../../talabat_delivery_sample.csv'),
    path.resolve(__dirname, 'talabat_delivery_sample.csv')
  ];

  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { map, list } = parseCSV(fileContent);
        if (map.size > 0) {
          orderMap = map;
          orderList = list;
          console.log(`[DeliveryService] Ingested ${orderMap.size} delivery orders from: ${filePath}`);
          return;
        }
      }
    } catch (err) {
      console.warn(`[DeliveryService] Unable to read from ${filePath}:`, err.message);
    }
  }

  // Backup fallback ingestion
  orderMap = new Map();
  orderList = [...STATIC_DELIVERY_DATASET];
  STATIC_DELIVERY_DATASET.forEach(order => orderMap.set(order.Order_ID, order));
  console.log(`[DeliveryService] Initialized with ${orderMap.size} backup delivery records`);
}

// Ingest immediately upon module load
initDeliveryService();

/**
 * Check if the user query is intended for delivery tracking
 */
export function isDeliveryTrackingIntent(message) {
  if (!message || typeof message !== 'string') return false;
  const q = message.trim().toLowerCase();

  // If asking purely about gold rates (like "22k gold rate"), ignore unless tracking is mentioned
  const isRateQuery = /\b(gold rate|silver rate|rate per gram|22k|24k|18k)\b/i.test(q);
  const hasTrackWord = /\b(track|tracking|tracker|where is|where's|status|delivery)\b/i.test(q);
  if (isRateQuery && !hasTrackWord) return false;

  const trackingPhrases = [
    /\b(track|tracking|tracker)\b/i,
    /\bwhere\s+(is|are|'s)\s+(my\s+|the\s+)?(order|delivery|package|parcel|food)\b/i,
    /\b(status\s+of\s+(my\s+|the\s+)?(order|delivery|package|parcel))\b/i,
    /\b(order|delivery)\s+status\b/i,
    /\bcheck\s+(my\s+|the\s+)?(order|delivery|status)\b/i,
    /\bdelivery\s+(status|time|update|duration|track)\b/i,
    /\bwhere\s+has\s+my\s+(order|delivery)\b/i,
    /\b(when\s+will\s+my\s+(order|delivery)\s+(arrive|reach|deliver))\b/i
  ];

  if (trackingPhrases.some(pattern => pattern.test(q))) {
    return true;
  }

  if (/\border\s*#?\s*\d+\b/i.test(q)) {
    return true;
  }

  if (/^#?\s*\d+\s*$/.test(q)) {
    return true;
  }

  return false;
}

/**
 * Extract numeric Order_ID from user message
 */
export function extractOrderId(message) {
  const text = (message || '').trim();

  // 1. "order #3", "order 3", "order id 3", "order no: 3", "order number 3"
  const orderMatch = text.match(/\border\s*(?:id|no|number)?[\s#:]*(\d+)\b/i);
  if (orderMatch) return parseInt(orderMatch[1], 10);

  // 2. "track #3", "track 3", "tracking #3"
  const trackMatch = text.match(/\btrack(?:ing)?[\s#:]*(\d+)\b/i);
  if (trackMatch) return parseInt(trackMatch[1], 10);

  // 3. "delivery #3", "delivery 3"
  const deliveryMatch = text.match(/\bdelivery\s*(?:id|no|number|status)?[\s#:]*(\d+)\b/i);
  if (deliveryMatch) return parseInt(deliveryMatch[1], 10);

  // 4. "#3", "# 22"
  const hashMatch = text.match(/#\s*(\d+)\b/);
  if (hashMatch) return parseInt(hashMatch[1], 10);

  // 5. "status of 3"
  const statusOfMatch = text.match(/\bstatus\s+of\s+#?\s*(\d+)\b/i);
  if (statusOfMatch) return parseInt(statusOfMatch[1], 10);

  // 6. Solo digits or "#<digits>"
  const soloMatch = text.match(/^#?\s*(\d+)\s*$/);
  if (soloMatch) return parseInt(soloMatch[1], 10);

  // 7. Any standalone number if query is clearly a delivery/tracking query
  if (isDeliveryTrackingIntent(text)) {
    const anyDigit = text.match(/\b(\d+)\b/);
    if (anyDigit) {
      const digitStr = anyDigit[1];
      const idx = text.indexOf(digitStr);
      const after = text.slice(idx + digitStr.length).trim().toLowerCase();
      if (!after.startsWith('k') && !after.startsWith('kt') && !after.startsWith('g') && !after.startsWith('gram')) {
        return parseInt(digitStr, 10);
      }
    }
  }

  return null;
}

/**
 * Format delivery status response according to strict concierge specifications
 */
export function handleDeliveryTracking(userMessage) {
  if (!userMessage || typeof userMessage !== 'string') return null;

  if (!isDeliveryTrackingIntent(userMessage)) {
    return null;
  }

  const orderId = extractOrderId(userMessage);

  if (orderId === null || isNaN(orderId)) {
    return "Please provide your Order ID (1 to 50) to check your live delivery status.";
  }

  const order = orderMap.get(orderId);
  if (!order) {
    return `We couldn't find any record for Order #${orderId}. Please check and provide a valid Order ID between 1 and 50.`;
  }

  return `Your order #${order.Order_ID} for ${order.Quantity}x ${order.Item_Name} in ${order.City} is currently ${order.Order_Status}. Delivery duration: ~${order.Delivery_Duration_Minutes} mins via ${order.Driver_Vehicle} (Traffic: ${order.Traffic_Level}).`;
}

export function getOrder(orderId) {
  return orderMap.get(Number(orderId)) || null;
}

export function getAllOrders() {
  return orderList;
}
