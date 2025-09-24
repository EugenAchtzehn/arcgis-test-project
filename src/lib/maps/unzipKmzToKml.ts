import { loadAsync } from "jszip";

/**
 * 從 KMZ 檔案中提取 KML 內容
 * @param data - KMZ 檔案的 ArrayBuffer 資料
 * @returns KML 檔案的文字內容
 * @throws 如果找不到 KML 檔案或解壓縮失敗
 */
export async function unzipKmzToKml(data: ArrayBuffer): Promise<string> {
  try {
    const zip = await loadAsync(data);
    const kmlFile = Object.values(zip.files).find((file) => file.name.endsWith(".kml"));

    if (!kmlFile) {
      throw new Error("KMZ 檔案中找不到 KML 檔案");
    }

    const kmlText = await kmlFile.async("text");
    if (!kmlText) {
      throw new Error("無法讀取 KML 檔案內容");
    }

    return kmlText;
  } catch (error) {
    console.error("KMZ 解壓縮失敗:", error);
    throw new Error(`KMZ 檔案處理失敗: ${error instanceof Error ? error.message : "未知錯誤"}`);
  }
}
