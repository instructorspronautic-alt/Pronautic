export async function readSheet(
  accessToken: string, 
  sheetName: string
): Promise<string[][]> {
  const sheetId = (import.meta as any).env.VITE_SHEETS_DB_ID;
  if (!sheetId) throw new Error("VITE_SHEETS_DB_ID no está configurado");

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error leyendo Sheets: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.values || [];
}

export async function writeSheet(
  accessToken: string,
  sheetName: string,
  rows: string[][]
): Promise<void> {
  const sheetId = (import.meta as any).env.VITE_SHEETS_DB_ID;
  if (!sheetId) throw new Error("VITE_SHEETS_DB_ID no está configurado");

  // Uso de PUT con values:update
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}?valueInputOption=USER_ENTERED`;
  
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      range: sheetName,
      majorDimension: "ROWS",
      values: rows
    })
  });

  if (!response.ok) {
    throw new Error(`Error escribiendo a Sheets: ${response.status} ${response.statusText}`);
  }
}

export async function appendRow(
  accessToken: string,
  sheetName: string,
  row: string[]
): Promise<void> {
  const sheetId = (import.meta as any).env.VITE_SHEETS_DB_ID;
  if (!sheetId) throw new Error("VITE_SHEETS_DB_ID no está configurado");

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}:append?valueInputOption=USER_ENTERED`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      range: sheetName,
      majorDimension: "ROWS",
      values: [row]
    })
  });

  if (!response.ok) {
    throw new Error(`Error añadiendo a Sheets: ${response.status} ${response.statusText}`);
  }
}
