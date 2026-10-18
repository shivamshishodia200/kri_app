import axios from 'axios';

const API_URL = 'https://api.data.gov.in/resource/5c2f62fe-5afa-4119-a499-fec9d604d5bd';
const API_KEY = '579b464db66ec23bdd000001cdc3b564546246a772a26393094f5645';

// Cache system
let cachedAllData = [];
let cacheTimestamp = null;
let isFetching = false;
let isInitialLoadComplete = false;
let totalRecordsFetched = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const INITIAL_LOAD_SIZE = 10000; // First 10k records for quick start

// Function to fetch data in batches (parallel)
const fetchBatch = async (offset, limit) => {
    try {
        const response = await axios.get(API_URL, {
            params: {
                'api-key': API_KEY,
                format: 'json',
                offset: offset,
                limit: limit
            },
            timeout: 30000
        });

        return response.data?.records || [];
    } catch (error) {
        console.error(`Error fetching batch at offset ${offset}:`, error.message);
        return [];
    }
};

// Fast initial load - parallel fetching
const quickInitialLoad = async () => {
    console.log('🚀 Quick initial load starting...');
    
    try {
        // Fetch first 10k records in parallel batches of 500
        const batchSize = 500;
        const batches = [];
        
        for (let i = 0; i < INITIAL_LOAD_SIZE; i += batchSize) {
            batches.push(fetchBatch(i, batchSize));
        }
        
        const results = await Promise.all(batches);
        const records = results.flat();
        
        cachedAllData = records;
        totalRecordsFetched = records.length;
        isInitialLoadComplete = true;
        
        const uniqueStates = new Set(records.map(r => r.statename).filter(Boolean));
        console.log(`✅ Quick load done: ${records.length} records, ${uniqueStates.size} states`);
        
        return records;
    } catch (error) {
        console.error('Quick load failed:', error.message);
        return [];
    }
};

// Background full load - continues after quick load
const backgroundFullLoad = async () => {
    if (isFetching) return;
    
    isFetching = true;
    console.log('📦 Background full load starting...');
    
    try {
        let offset = INITIAL_LOAD_SIZE; // Start from where quick load ended
        const limit = 500;
        let consecutiveFailures = 0;
        const maxRecords = 50000;
        
        while (offset < maxRecords && consecutiveFailures < 3) {
            try {
                const records = await fetchBatch(offset, limit);
                
                if (records.length > 0) {
                    cachedAllData = cachedAllData.concat(records);
                    totalRecordsFetched = cachedAllData.length;
                    consecutiveFailures = 0;
                    
                    // Log every 5000 records
                    if (totalRecordsFetched % 5000 === 0) {
                        const uniqueStates = new Set(cachedAllData.map(r => r.statename).filter(Boolean));
                        console.log(`📊 Progress: ${totalRecordsFetched} records, ${uniqueStates.size} states`);
                    }
                    
                    if (records.length < limit) {
                        console.log('📍 End of data reached');
                        break;
                    }
                } else {
                    consecutiveFailures++;
                }
                
                offset += limit;
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 50));
                
            } catch (error) {
                console.error(`Error at offset ${offset}:`, error.message);
                consecutiveFailures++;
            }
        }
        
        cacheTimestamp = Date.now();
        const uniqueStates = new Set(cachedAllData.map(r => r.statename).filter(Boolean));
        console.log(`✅ Full load completed: ${totalRecordsFetched} records, ${uniqueStates.size} states`);
        
    } catch (error) {
        console.error('Background load failed:', error.message);
    } finally {
        isFetching = false;
    }
};

// Function to get cached data or fetch if needed
const getCachedData = async () => {
    // If cache is valid and complete, return it
    if (cachedAllData.length > 0 && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
        return cachedAllData;
    }
    
    // If initial load is done, return what we have (background load continues)
    if (isInitialLoadComplete && cachedAllData.length > 0) {
        return cachedAllData;
    }
    
    // If nothing cached, do quick initial load
    if (cachedAllData.length === 0) {
        await quickInitialLoad();
        // Start background load for rest of data
        setTimeout(backgroundFullLoad, 100);
    }
    
    return cachedAllData;
};

// Initialize cache on startup - quick load first
setTimeout(async () => {
    console.log('🔄 Initializing location data cache...');
    await quickInitialLoad();
    // Start full background load
    setTimeout(backgroundFullLoad, 1000);
}, 2000); // Start after 2 seconds of server startup

// Get all unique states
export const getAllStates = async (req, res) => {
    try {
        console.log('Fetching all unique states...');
        
        const data = await getCachedData();
        
        if (data.length === 0) {
            return res.status(503).json({
                success: false,
                message: 'Data is being loaded. Please try again in a few moments.'
            });
        }
        
        // Extract unique states
        const statesSet = new Set();
        data.forEach(record => {
            if (record.statename) {
                statesSet.add(record.statename);
            }
        });

        const states = Array.from(statesSet).sort();
        
        console.log(`Total unique states found: ${states.length}`);
        
        res.status(200).json({
            success: true,
            count: states.length,
            totalRecords: data.length,
            isLoadingComplete: !isFetching,
            loadProgress: `${totalRecordsFetched} records loaded`,
            data: states
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching states',
            error: error.message
        });
    }
};

// Get districts by state
export const getDistrictsByState = async (req, res) => {
    try {
        const { state } = req.params;
        
        if (!state) {
            return res.status(400).json({
                success: false,
                message: 'State name is required'
            });
        }

        console.log(`Fetching districts for state: ${state}`);
        
        const data = await getCachedData();
        
        if (data.length === 0) {
            return res.status(503).json({
                success: false,
                message: 'Data is being loaded. Please try again in a few moments.'
            });
        }
        
        // Filter by state and extract unique districts
        const districtsSet = new Set();
        data.forEach(record => {
            if (record.statename && 
                record.statename.toUpperCase() === state.toUpperCase() && 
                record.district) {
                districtsSet.add(record.district);
            }
        });

        const districts = Array.from(districtsSet).sort();
        
        if (districts.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No districts found for the given state'
            });
        }

        console.log(`Total districts found for ${state}: ${districts.length}`);

        res.status(200).json({
            success: true,
            state: state,
            count: districts.length,
            data: districts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching districts',
            error: error.message
        });
    }
};

// Get cities by district
export const getCitiesByDistrict = async (req, res) => {
    try {
        const { district } = req.params;
        const { state } = req.query;
        
        if (!district) {
            return res.status(400).json({
                success: false,
                message: 'District name is required'
            });
        }

        console.log(`Fetching cities for district: ${district}`);
        
        const data = await getCachedData();
        
        if (data.length === 0) {
            return res.status(503).json({
                success: false,
                message: 'Data is being loaded. Please try again in a few moments.'
            });
        }
        
        // Filter by district and extract unique cities
        const citiesMap = new Map();
        data.forEach(record => {
            if (record.district && record.district.toUpperCase() === district.toUpperCase()) {
                // If state is provided, also filter by state
                if (state && record.statename.toUpperCase() !== state.toUpperCase()) {
                    return;
                }
                
                if (record.officename && !citiesMap.has(record.officename)) {
                    citiesMap.set(record.officename, {
                        name: record.officename,
                        officetype: record.officetype,
                        delivery: record.delivery,
                        pincode: record.pincode
                    });
                }
            }
        });

        const cities = Array.from(citiesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
        
        if (cities.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No cities found for the given district'
            });
        }

        console.log(`Total cities found for ${district}: ${cities.length}`);

        res.status(200).json({
            success: true,
            district: district,
            count: cities.length,
            data: cities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching cities',
            error: error.message
        });
    }
};

// Get pincode details by city/office name
export const getPincodeByCity = async (req, res) => {
    try {
        const { city } = req.params;
        const { district, state, limit } = req.query;
        const maxResults = parseInt(limit) || 50;
        
        if (!city) {
            return res.status(400).json({
                success: false,
                message: 'City/Office name is required'
            });
        }

        console.log(`Fetching pincode for city: ${city}`);
        
        const data = await getCachedData();
        
        if (data.length === 0) {
            return res.status(503).json({
                success: false,
                message: 'Data is being loaded. Please try again in a few moments.'
            });
        }
        
        const searchCity = city.toUpperCase().trim();
        const searchCityNoSpace = searchCity.replace(/\s+/g, '');
        
        // Remove common suffixes for better matching
        const cleanSearchTerm = searchCity
            .replace(/\s+(GPO|H\.O|S\.O|B\.O)$/i, '')
            .trim();
        
        // Filter by city/office name with flexible matching
        const pincodeDetails = [];
        const suggestions = new Set();
        
        data.forEach(record => {
            if (pincodeDetails.length >= maxResults) return;
            
            if (record.officename) {
                const recordName = record.officename.toUpperCase();
                const recordNameNoSpace = recordName.replace(/\s+/g, '');
                
                // Multiple matching strategies
                const cleanRecordName = recordName
                    .replace(/\s+(GPO|H\.O|S\.O|B\.O)$/i, '')
                    .trim();
                
                const isMatch = 
                    recordName === searchCity ||
                    recordName.includes(searchCity) ||
                    recordNameNoSpace.includes(searchCityNoSpace) ||
                    searchCity.includes(cleanRecordName) ||
                    cleanRecordName.includes(cleanSearchTerm) ||
                    (cleanSearchTerm.length > 3 && recordName.includes(cleanSearchTerm));
                
                if (isMatch) {
                    // Apply optional filters
                    if (district && record.district && record.district.toUpperCase() !== district.toUpperCase()) {
                        return;
                    }
                    if (state && record.statename && record.statename.toUpperCase() !== state.toUpperCase()) {
                        return;
                    }
                    
                    pincodeDetails.push({
                        pincode: record.pincode,
                        officename: record.officename,
                        officetype: record.officetype,
                        delivery: record.delivery,
                        district: record.district,
                        statename: record.statename,
                        divisionname: record.divisionname,
                        regionname: record.regionname,
                        circlename: record.circlename,
                        latitude: record.latitude,
                        longitude: record.longitude
                    });
                }
                
                // Collect suggestions for similar matches
                if (suggestions.size < 20) {
                    if (recordName.includes(cleanSearchTerm) || 
                        recordNameNoSpace.includes(searchCityNoSpace) ||
                        cleanRecordName.includes(cleanSearchTerm)) {
                        suggestions.add(record.officename);
                    }
                }
            }
        });
        
        if (pincodeDetails.length === 0) {
            const suggestionList = Array.from(suggestions).sort().slice(0, 10);
            
            // If no suggestions with current search, try first few letters
            if (suggestionList.length === 0 && cleanSearchTerm.length > 2) {
                const firstLetters = cleanSearchTerm.substring(0, Math.min(5, cleanSearchTerm.length));
                data.forEach(record => {
                    if (record.officename && suggestions.size < 10) {
                        const recordName = record.officename.toUpperCase();
                        if (recordName.startsWith(firstLetters)) {
                            suggestions.add(record.officename);
                        }
                    }
                });
            }
            
            const finalSuggestions = Array.from(suggestions).sort().slice(0, 10);
            
            return res.status(404).json({
                success: false,
                message: `No pincode found for "${city}"`,
                suggestions: finalSuggestions.length > 0 ? finalSuggestions : undefined,
                hint: finalSuggestions.length > 0 
                    ? 'Try one of the suggested office names or use /api/location/find/:keyword for broader search'
                    : 'Try using /api/location/find/:keyword for general search',
                totalRecordsSearched: data.length
            });
        }

        res.status(200).json({
            success: true,
            city: city,
            count: pincodeDetails.length,
            data: pincodeDetails
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching pincode',
            error: error.message
        });
    }
};

// Search by pincode
export const searchByPincode = async (req, res) => {
    try {
        const { pincode } = req.params;
        
        if (!pincode) {
            return res.status(400).json({
                success: false,
                message: 'Pincode is required'
            });
        }

        console.log(`Searching for pincode: ${pincode}`);
        
        const data = await getCachedData();
        
        if (data.length === 0) {
            return res.status(503).json({
                success: false,
                message: 'Data is being loaded. Please try again in a few moments.'
            });
        }
        
        // Filter by pincode
        const results = [];
        data.forEach(record => {
            if (record.pincode === pincode) {
                results.push({
                    pincode: record.pincode,
                    officename: record.officename,
                    officetype: record.officetype,
                    delivery: record.delivery,
                    district: record.district,
                    statename: record.statename,
                    divisionname: record.divisionname,
                    regionname: record.regionname,
                    circlename: record.circlename,
                    latitude: record.latitude,
                    longitude: record.longitude
                });
            }
        });
        
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No details found for the given pincode'
            });
        }

        res.status(200).json({
            success: true,
            pincode: pincode,
            count: results.length,
            data: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching pincode',
            error: error.message
        });
    }
};

// General search API - search by any keyword
export const generalSearch = async (req, res) => {
    try {
        const { keyword } = req.params;
        const { limit } = req.query;
        const maxResults = parseInt(limit) || 50;
        
        if (!keyword || keyword.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Keyword must be at least 2 characters long'
            });
        }

        console.log(`General search for keyword: ${keyword}`);
        
        const data = await getCachedData();
        
        if (data.length === 0) {
            return res.status(503).json({
                success: false,
                message: 'Data is being loaded. Please try again in a few moments.'
            });
        }
        
        const searchKeyword = keyword.toUpperCase().trim();
        const searchKeywordNoSpace = searchKeyword.replace(/\s+/g, '');
        
        // Search in multiple fields
        const results = [];
        const uniqueResults = new Set();
        
        data.forEach(record => {
            if (results.length >= maxResults) return;
            
            // Create unique key to avoid duplicates
            const uniqueKey = `${record.pincode}-${record.officename}`;
            if (uniqueResults.has(uniqueKey)) return;
            
            const officeName = (record.officename || '').toUpperCase();
            const officeNameNoSpace = officeName.replace(/\s+/g, '');
            const district = (record.district || '').toUpperCase();
            const stateName = (record.statename || '').toUpperCase();
            const pincode = record.pincode || '';
            
            // Check if keyword matches in any field
            const isMatch = 
                officeName.includes(searchKeyword) ||
                officeNameNoSpace.includes(searchKeywordNoSpace) ||
                district.includes(searchKeyword) ||
                stateName.includes(searchKeyword) ||
                pincode === keyword;
            
            if (isMatch) {
                uniqueResults.add(uniqueKey);
                results.push({
                    pincode: record.pincode,
                    officename: record.officename,
                    officetype: record.officetype,
                    delivery: record.delivery,
                    district: record.district,
                    statename: record.statename,
                    divisionname: record.divisionname,
                    regionname: record.regionname,
                    circlename: record.circlename,
                    latitude: record.latitude,
                    longitude: record.longitude
                });
            }
        });
        
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No results found for "${keyword}"`,
                hint: 'Try different keywords or use specific district/state search'
            });
        }

        res.status(200).json({
            success: true,
            keyword: keyword,
            count: results.length,
            hasMore: results.length === maxResults,
            data: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error performing search',
            error: error.message
        });
    }
};

// Get office names by search keyword (for dropdown/selection)
export const getOfficeNames = async (req, res) => {
    try {
        const { keyword } = req.params;
        const { state, district, limit } = req.query;
        const maxResults = parseInt(limit) || 100;
        
        if (!keyword || keyword.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Keyword must be at least 2 characters long'
            });
        }

        console.log(`Searching office names for: ${keyword}`);
        
        const data = await getCachedData();
        
        if (data.length === 0) {
            return res.status(503).json({
                success: false,
                message: 'Data is being loaded. Please try again in a few moments.'
            });
        }
        
        const searchKeyword = keyword.toUpperCase().trim();
        const searchKeywordNoSpace = searchKeyword.replace(/\s+/g, '');
        
        const officeNames = [];
        const uniqueOffices = new Set();
        
        data.forEach(record => {
            if (officeNames.length >= maxResults) return;
            
            if (record.officename && !uniqueOffices.has(record.officename)) {
                const officeName = record.officename.toUpperCase();
                const officeNameNoSpace = officeName.replace(/\s+/g, '');
                
                // Apply filters
                if (state && record.statename && record.statename.toUpperCase() !== state.toUpperCase()) {
                    return;
                }
                if (district && record.district && record.district.toUpperCase() !== district.toUpperCase()) {
                    return;
                }
                
                // Check match
                if (officeName.includes(searchKeyword) || officeNameNoSpace.includes(searchKeywordNoSpace)) {
                    uniqueOffices.add(record.officename);
                    officeNames.push({
                        officename: record.officename,
                        pincode: record.pincode,
                        district: record.district,
                        state: record.statename,
                        officetype: record.officetype
                    });
                }
            }
        });
        
        if (officeNames.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No offices found for "${keyword}"`
            });
        }

        // Sort by office name
        officeNames.sort((a, b) => a.officename.localeCompare(b.officename));

        res.status(200).json({
            success: true,
            keyword: keyword,
            count: officeNames.length,
            data: officeNames
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching office names',
            error: error.message
        });
    }
};

// Get pincode by exact office name
export const getPincodeByOfficeName = async (req, res) => {
    try {
        const { officename } = req.params;
        
        if (!officename) {
            return res.status(400).json({
                success: false,
                message: 'Office name is required'
            });
        }

        console.log(`Getting pincode for office: ${officename}`);
        
        const data = await getCachedData();
        
        if (data.length === 0) {
            return res.status(503).json({
                success: false,
                message: 'Data is being loaded. Please try again in a few moments.'
            });
        }
        
        const searchOfficeName = officename.toUpperCase().trim();
        
        // Find exact match
        const result = data.find(record => 
            record.officename && record.officename.toUpperCase() === searchOfficeName
        );
        
        if (!result) {
            // Try partial match
            const partialMatches = [];
            data.forEach(record => {
                if (record.officename && record.officename.toUpperCase().includes(searchOfficeName)) {
                    partialMatches.push({
                        officename: record.officename,
                        pincode: record.pincode,
                        district: record.district,
                        state: record.statename
                    });
                }
            });
            
            if (partialMatches.length > 0) {
                return res.status(200).json({
                    success: true,
                    message: 'Exact match not found, showing similar offices',
                    count: partialMatches.length,
                    data: partialMatches.slice(0, 20)
                });
            }
            
            return res.status(404).json({
                success: false,
                message: `Office "${officename}" not found`
            });
        }

        res.status(200).json({
            success: true,
            data: {
                pincode: result.pincode,
                officename: result.officename,
                officetype: result.officetype,
                delivery: result.delivery,
                district: result.district,
                statename: result.statename,
                divisionname: result.divisionname,
                regionname: result.regionname,
                circlename: result.circlename,
                latitude: result.latitude,
                longitude: result.longitude
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching pincode',
            error: error.message
        });
    }
};
