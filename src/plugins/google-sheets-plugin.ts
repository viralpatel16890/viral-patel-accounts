import type { Plugin } from 'vite'
import { GoogleSheetsService } from '../services/googleSheets'

export function googleSheetsPlugin(): Plugin {
  return {
    name: 'google-sheets-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Only handle API requests
        if (!req.url?.startsWith('/api/google-sheets')) {
          next()
          return
        }

        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

        if (req.method === 'OPTIONS') {
          res.statusCode = 200
          res.end()
          return
        }

        if (req.method === 'GET') {
          const url = new URL(req.url!, `http://localhost:5173`)
          const pathParts = url.pathname.split('/')
          
          console.log('API Request path:', url.pathname)
          console.log('Path parts:', pathParts)
          
          // Handle /api/google-sheets/sheet/{sheetName}
          if (pathParts.length >= 5 && pathParts[3] === 'sheet') {
            const sheetName = pathParts[4] || 'Sheet1'
            
            console.log('Fetching sheet data for:', sheetName)
            
            try {
              // Try to get real data from Google Sheets
              const spreadsheetId = process.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID || '1EhSkx5qFzjWdVTCi-QJuf_OZx7cF1S01'
              const sheetsService = new GoogleSheetsService(spreadsheetId)
              const sheetData = await sheetsService.getSheetData(sheetName)
              
              res.setHeader('Content-Type', 'application/json')
              res.statusCode = 200
              res.end(JSON.stringify(sheetData))
            } catch (error) {
              console.error('Google Sheets API error:', error)
              
              // Fallback to mock data if API fails
              const mockSheetData = {
                sheetName: sheetName,
                data: [
                  { 
                    'Receipt No.': 'R001', 
                    'Date': '2024-01-01', 
                    'Sub-Categories': 'Software', 
                    'Product Names': 'Domain Registration', 
                    'Categories / Types': 'Service', 
                    'Income / Expense': 'Income', 
                    'ICANN fee': 0.18, 
                    'Length': '1 year', 
                    'Subtotal amount': 15.00, 
                    'Tax amount': 1.35, 
                    'Order total': 16.53 
                  }
                ]
              }

              res.setHeader('Content-Type', 'application/json')
              res.statusCode = 200
              res.end(JSON.stringify(mockSheetData))
            }
            return
          }
          
          // Handle /api/google-sheets (list sheets)
          console.log('Fetching sheet list')
          
          try {
            // Mock data for testing
            const mockSheets = [
              { title: 'Sheet1', sheetId: '0' },
              { title: 'Financial Data', sheetId: '123456' },
              { title: 'Transactions', sheetId: '789012' }
            ]

            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(JSON.stringify(mockSheets))
          } catch (error) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Failed to fetch sheets' }))
          }
          return
        }

        next()
      })
    }
  }
}
