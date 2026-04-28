import { GoogleSheetsService } from '../services/googleSheets';
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';

// Mocking dependencies
vi.mock('google-spreadsheet');
vi.mock('google-auth-library');

// Typed mocks for better intellisense and safety
const MockGoogleSpreadsheet = GoogleSpreadsheet as vi.MockedClass<typeof GoogleSpreadsheet>;
const MockJWT = JWT as vi.MockedClass<typeof JWT>;

// Mock instances and methods
const mockDocInstance = {
  useServiceAccountAuth: vi.fn().mockResolvedValue(undefined),
  loadInfo: vi.fn().mockResolvedValue(undefined),
  sheetsByTitle: {},
};
MockGoogleSpreadsheet.mockImplementation(function() {
  return mockDocInstance;
});

const mockJwtInstance = {
  // Add necessary methods if needed for authentication mocking
};
MockJWT.mockImplementation(function() {
  return mockJwtInstance;
});

describe('GoogleSheetsService', () => {
  let service: GoogleSheetsService;
  const mockSpreadsheetId = 'test-spreadsheet-id';

  // Mocking process.env to avoid issues with missing environment variables
  const originalProcessEnv = process.env;
  beforeAll(() => {
    process.env = {
      ...originalProcessEnv,
      VITE_GOOGLE_SHEETS_CLIENT_EMAIL: 'test-email@example.com',
      // Mock private key with proper escaping
      VITE_GOOGLE_SHEETS_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\\nMocKKeyValueHere\\n-----END PRIVATE KEY-----',
      GOOGLE_SHEETS_SPREADSHEET_ID: mockSpreadsheetId,
    };
  });
  afterAll(() => {
    process.env = originalProcessEnv; // Restore original environment
  });

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    MockGoogleSpreadsheet.mockClear();
    mockDocInstance.useServiceAccountAuth.mockClear();
    mockDocInstance.loadInfo.mockClear();
    mockDocInstance.sheetsByTitle = {}; // Reset sheets for each test

    // Create a new service instance for each test
    service = new GoogleSheetsService(mockSpreadsheetId);
  });

  describe('initialize', () => {
    it('should initialize only once', async () => {
      await service['initialize']();
      await service['initialize'](); // Call again to ensure it's idempotent
      expect(MockGoogleSpreadsheet).toHaveBeenCalledTimes(1);
      expect(mockDocInstance.useServiceAccountAuth).toHaveBeenCalledTimes(1);
      expect(mockDocInstance.loadInfo).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSheetData', () => {
    it('should return mapped transactions for a given sheet title', async () => {
      const mockSheetTitle = 'Transactions';
      const mockRawValues = [
        ['Date', 'Description', 'Amount', 'Type', 'Category', 'Payment Method'],
        ['2023-01-01', 'Salary', '5000', 'income', 'Income', 'Bank'],
        ['2023-01-05', 'Groceries', '-200', 'expense', 'Food', 'Card'],
      ];

      // Mock the sheet instance and its getValues method
      const mockSheetInstance = {
        getValues: vi.fn().mockResolvedValue(mockRawValues),
        getRows: vi.fn(), // Not directly used by getSheetData's logic here, but good to acknowledge
      };
      mockDocInstance.sheetsByTitle[mockSheetTitle] = mockSheetInstance;

      // Spy on the private method mapSheetValuesToTransactions
      const mapSheetSpy = vi.spyOn(service as any, 'mapSheetValuesToTransactions');
      // Provide a specific return value for the spy
      const mappedTransactions = [{ transaction_id: 'GSHEET-TXN-0001', date: '2023-01-01', description: 'Salary', type: 'income', amount: 5000, category: 'Income', payment_method: 'Bank', status: 'approved', sub_category: 'General', tax: 0, notes: '', created_by: 'google.sheets.sync', approved_by: 'google.sheets.sync', timestamp: new Date('2023-01-01').toISOString(), attachment: false }, { transaction_id: 'GSHEET-TXN-0002', date: '2023-01-05', description: 'Groceries', type: 'expense', amount: 200, category: 'Food', payment_method: 'Card', status: 'approved', sub_category: 'General', tax: 0, notes: '', created_by: 'google.sheets.sync', approved_by: 'google.sheets.sync', timestamp: new Date('2023-01-05').toISOString(), attachment: false }];
      mapSheetSpy.mockReturnValue(mappedTransactions);

      const result = await service.getSheetData(mockSheetTitle);

      expect(mockDocInstance.sheetsByTitle[mockSheetTitle].getValues).toHaveBeenCalled();
      expect(mapSheetSpy).toHaveBeenCalledWith(mockRawValues);
      expect(result).toEqual(mappedTransactions);
      mapSheetSpy.mockRestore(); // Restore the spy
    });

    it('should return an empty array if the sheet has no data rows', async () => {
      const mockSheetTitle = 'EmptySheet';
      const mockRawValues = [
        ['Date', 'Description', 'Amount'], // Headers only
      ];

      const mockSheetInstance = {
        getValues: vi.fn().mockResolvedValue(mockRawValues),
        getRows: vi.fn(),
      };
      mockDocInstance.sheetsByTitle[mockSheetTitle] = mockSheetInstance;

      vi.spyOn(service as any, 'mapSheetValuesToTransactions').mockReturnValue([]);

      const result = await service.getSheetData(mockSheetTitle);

      expect(mockDocInstance.sheetsByTitle[mockSheetTitle].getValues).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should throw an error if sheet is not found', async () => {
      const nonExistentSheetTitle = 'NonExistentSheet';
      await expect(service.getSheetData(nonExistentSheetTitle)).rejects.toThrow(`Sheet "${nonExistentSheetTitle}" not found`);
    });
  });

  describe('getAllSheetTitles', () => {
    it('should return an array of sheet titles', async () => {
      mockDocInstance.sheetsByTitle = {
        'Sheet1': {},
        'Transactions': {},
        'Budgets': {},
      };
      const titles = await service.getAllSheetTitles();
      expect(titles).toEqual(['Sheet1', 'Transactions', 'Budgets']);
    });
  });
});
