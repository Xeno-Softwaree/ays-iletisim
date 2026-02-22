import { useState, useMemo, useEffect } from 'react';

interface FilterConfig {
    searchKeys: string[];
    // filters is an object where key is the field name and value is the filter value
    // If value is 'all' or '' or null, filter is ignored.
}

export function useFilteredData<T>(data: T[], config: FilterConfig) {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [filters, setFilters] = useState<Record<string, any>>({});

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Filter Logic
    const filteredData = useMemo(() => {
        let result = [...data];

        // 1. Search
        if (debouncedSearchTerm.trim()) {
            const lowerTerm = debouncedSearchTerm.toLowerCase().trim();
            result = result.filter((item) => {
                return config.searchKeys.some((key) => {
                    const value = getNestedValue(item, key);
                    return String(value ?? '').toLowerCase().includes(lowerTerm);
                });
            });
        }

        // 2. Filters
        Object.entries(filters).forEach(([key, filterValue]) => {
            if (filterValue === 'all' || filterValue === '' || filterValue === null || filterValue === undefined) {
                return;
            }

            result = result.filter((item) => {
                const itemValue = getNestedValue(item, key);
                // Handle rough equality (e.g. number vs string)
                return String(itemValue) === String(filterValue);
            });
        });

        return result;
    }, [data, debouncedSearchTerm, filters, config.searchKeys]);

    const setFilter = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        setSearchTerm('');
        setFilters({});
    };

    return {
        filteredData,
        searchTerm,
        setSearchTerm,
        filters,
        setFilter,
        resetFilters,
        loading: false // Helper for UI loading states if needed
    };
}

// Helper to access nested properties like 'brand.name'
function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}
