import { identifyObject } from '../ObjectRecognitionService';
import { Platform } from 'react-native';

// Mock global fetch
global.fetch = jest.fn();

describe('ObjectRecognitionService', () => {
    beforeEach(() => {
        (fetch as jest.Mock).mockClear();
    });

    it('successfully handles a known object prediction (High Fidelity)', async () => {
        const mockResponse = {
            ok: true,
            json: async () => ({
                predictions: [
                    { className: 'computer_keyboard', probability: 0.99 }
                ]
            })
        };
        (fetch as jest.Mock).mockResolvedValue(mockResponse);

        const result = await identifyObject('file:///dummy.jpg');
        
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(result).not.toBeNull();
        expect(result?.id).toBe('keyboard'); // MOCK_DB match
        expect(result?.components.length).toBeGreaterThan(0);
    });

    it('successfully handles an unknown object prediction (Dynamic Generation)', async () => {
        const mockResponse = {
            ok: true,
            json: async () => ({
                predictions: [
                    { className: 'space shuttle', probability: 0.85 }
                ]
            })
        };
        (fetch as jest.Mock).mockResolvedValue(mockResponse);

        const result = await identifyObject('file:///dummy.jpg');
        
        expect(result).not.toBeNull();
        expect(result?.name).toContain('Space Shuttle');
        expect(result?.id).toContain('dynamic');
    });

    it('returns null when API fails', async () => {
        (fetch as jest.Mock).mockRejectedValue(new Error('Network request failed'));
        
        // Suppress console.error for clean test output
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        const result = await identifyObject('file:///dummy.jpg');
        
        expect(result).toBeNull();
        spy.mockRestore();
    });
});
