<script lang="ts">
    interface Worksheet {
        id: string;
        title: string;
        data: Array<Array<string>>;
        headers?: string[];
    }
    
    interface Props {
        worksheets: Worksheet[];
        activeTab?: number;
    }
    
    let props = $props<Props>();
    
    let currentTab = $state(props.activeTab || 0);
    
    function setTab(index: number) {
        currentTab = index;
    }
    
    // Calculate max dimensions immediately
    let maxRows = Math.max(...props.worksheets.map(ws => ws.data?.length || 0), 0);
    let maxCols = Math.max(...props.worksheets.map(ws => ws.headers?.length || 0), 0);
    
    // Get current worksheet
    let currentWorksheet = $derived(props.worksheets[currentTab] || props.worksheets[0]);
    
    // Create padded worksheet function
    function createPaddedWorksheet(ws) {
        const paddedHeaders = ws.headers || Array(maxCols).fill('');
        const paddedData = ws.data || [];
        
        // Ensure data has maxRows
        const dataWithMaxRows = [...paddedData];
        while (dataWithMaxRows.length < maxRows) {
            dataWithMaxRows.push(Array(maxCols).fill(''));
        }
        
        // Ensure each row has maxCols
        const dataWithMaxCols = dataWithMaxRows.map(row => {
            const rowWithMaxCols = [...row];
            while (rowWithMaxCols.length < maxCols) {
                rowWithMaxCols.push('');
            }
            return rowWithMaxCols;
        });
        
        return {
            ...ws,
            headers: paddedHeaders,
            data: dataWithMaxCols
        };
    }
    
    // Reactive padded worksheet
    let paddedWorksheet = $derived(createPaddedWorksheet(currentWorksheet));
</script>

<div class="spreadsheet-container">
    <!-- Table display -->
    <div class="table-wrapper">
        <table class="worksheet-table">
            {#if paddedWorksheet.headers}
                <thead>
                    <tr>
                        {#each paddedWorksheet.headers as header}
                            <th>{header}</th>
                        {/each}
                    </tr>
                </thead>
            {/if}
            <tbody>
                {#each paddedWorksheet.data as row}
                    <tr>
                        {#each row as cell}
                            <td>{cell}</td>
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    
    <!-- Bottom tabs -->
    <div class="tabs-container">
        {#each props.worksheets as worksheet, index}
            <button 
                class="tab-button {currentTab === index ? 'active' : ''}" 
                onclick={() => setTab(index)}
            >
                {worksheet.title}
            </button>
        {/each}
    </div>
</div>

<style>
    .spreadsheet-container {
        margin: 1rem 0;
        border: 1px solid var(--color-border);
        border-radius: 4px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        width: 100%;
        min-height: 400px;
    }
    
    .table-wrapper {
        flex: 1;
        width: 100%;
        min-height: 350px;
        overflow-y: auto;
    }
    
    .worksheet-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        background-color: white;
        min-width: 100%;
    }
    
    .worksheet-table th,
    .worksheet-table td {
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--color-border);
        text-align: left;
        word-wrap: break-word;
        hyphens: auto;
        width: auto;
        min-width: 100px;
        max-width: 250px;
    }
    
    .worksheet-table th {
        background-color: var(--color-text-primary);
        color: var(--color-text-secondary);
        font-weight: 500;
        position: sticky;
        top: 0;
        z-index: 1;
    }
    
    .worksheet-table tr:nth-child(even) {
        background-color: var(--color-surface-1);
    }
    
    .worksheet-table tr:hover {
        background-color: var(--color-surface-2);
    }
    
    .tabs-container {
        display: flex;
        background-color: var(--color-surface-2);
        border-top: 1px solid var(--color-border);
        padding: 0.5rem;
        overflow-x: auto;
    }
    
    .tab-button {
        padding: 0.5rem 1rem;
        margin-right: 0.5rem;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: 4px;
        font-size: 0.9rem;
        transition: all 0.2s ease;
        white-space: nowrap;
        
        &:last-child {
            margin-right: 0;
        }
    }
    
    .tab-button:hover {
        background-color: var(--color-surface-3);
    }
    
    .tab-button.active {
        background-color: white;
        font-weight: 500;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
</style>