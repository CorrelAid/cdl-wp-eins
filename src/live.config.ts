import { defineLiveCollection } from 'astro:content';
import { ZOTERO_API_KEY, ZOTERO_GROUP_ID } from 'astro:env/server';
import { z } from 'astro/zod';

// Create a Zotero loader object with the required methods
const zoteroLoader = {
  loadCollection: async () => {

    if (!ZOTERO_API_KEY || !ZOTERO_GROUP_ID) {
      console.warn('Zotero API credentials not configured');
      return { entries: [] };
    }

    try {
      const response = await fetch(`https://api.zotero.org/groups/${ZOTERO_GROUP_ID}/items?format=json&limit=100`, {
        headers: {
          'Zotero-API-Key': ZOTERO_API_KEY,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Zotero API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform Zotero items to match our schema
      const entries = data.map((item: any) => {
        try {
          // Handle missing or null data
          if (!item.data) {
            console.warn(`Zotero item ${item.key} has no data, skipping`);
            return null;
          }
          return {
            id: item.key,
            data: {
              title: item.data.title || '',
              creators: item.data.creators ? item.data.creators.map((creator: any) => ({
                name: [creator.firstName, creator.lastName].filter(Boolean).join(' ') || creator.name || 'Unknown',
                firstName: creator.firstName,
                lastName: creator.lastName,
                creatorType: creator.creatorType
              })) : [],
              publicationTitle: item.data.publicationTitle || undefined,
              date: item.data.date || undefined,
              DOI: item.data.DOI || undefined,
              url: item.data.url || undefined,
              extra: item.data.extra || undefined,
              zoteroKey: item.key
            }
          };
        } catch (transformError) {
          console.error(`Error transforming Zotero item ${item.key}:`, transformError);
          console.log('Problematic item data:', JSON.stringify(item, null, 2));
          return null; // Skip problematic items instead of failing completely
        }
      }).filter((entry: any) => entry !== null); // Filter out null entries
      
      return { entries };
    } catch (error) {
      console.error('Error fetching Zotero quellen:', error);
      return { entries: [], error: error instanceof Error ? error : new Error('Unknown error') };
    }
  },
  
  loadEntry: async (id: string) => {
    const ZOTERO_API_KEY = import.meta.env.ZOTERO_API_KEY;
    const ZOTERO_USER_ID = import.meta.env.ZOTERO_USER_ID;
    const ZOTERO_LIBRARY_TYPE = import.meta.env.ZOTERO_LIBRARY_TYPE || 'user';

    if (!ZOTERO_API_KEY || !ZOTERO_USER_ID) {
      console.warn('Zotero API credentials not configured');
      return { entry: null, error: new Error('Zotero API credentials not configured') };
    }

    try {
      const response = await fetch(`https://api.zotero.org/${ZOTERO_LIBRARY_TYPE}s/${ZOTERO_USER_ID}/items/${id}?format=json`, {
        headers: {
          'Zotero-API-Key': ZOTERO_API_KEY,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Zotero API request failed: ${response.status} ${response.statusText}`);
      }

      const item = await response.json();
      
      if (!item.data) {
        return { entry: null, error: new Error('Item not found') };
      }
      
      const entry = {
        id: item.key,
        data: {
          title: item.data.title,
          creators: item.data.creators,
          publicationTitle: item.data.publicationTitle,
          date: item.data.date,
          DOI: item.data.DOI,
          url: item.data.url,
          zoteroKey: item.key
        }
      };
      
      return { entry };
    } catch (error) {
      console.error('Error fetching Zotero quellen item:', error);
      return { entry: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }
};

// Define the Zotero quellen live collection
const quellen = defineLiveCollection({
  type: 'live',
  schema: z.object({
    title: z.string().optional(),
    creators: z.array(
      z.object({
        name: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        creatorType: z.string().optional()
      })
    ).optional(),
    publicationTitle: z.string().optional(),
    date: z.string().optional(),
    DOI: z.string().optional(),
    url: z.string().optional(),
    extra: z.string().optional(),
    zoteroKey: z.string()
  }),
  loader: zoteroLoader
});

export const collections = { quellen };