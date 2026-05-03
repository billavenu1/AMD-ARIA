// test_hover.js
// This script simulates the frontend fetch call to test the hover card API endpoint.

async function testHoverAPI(chunkId, label) {
    console.log(`\n[Test: ${label}] Fetching chunk: ${chunkId}...`);
    try {
        // Use the absolute URL since we are running in Node.js instead of the browser
        const response = await fetch(`http://localhost:5055/api/sources/chunks/${chunkId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log(`[PASS] Success!`);
        console.log(`===========================================`);
        console.log(`Title:        `, data.source_title);
        console.log(`Chunk Index:  `, data.chunk_index);
        console.log(`Page Number:  `, data.page_number);
        console.log(`Text Preview: `, (data.text_content || '').substring(0, 80) + '...');
        console.log(`Images:       `, data.image_paths);
        console.log(`===========================================\n`);
        
    } catch (error) {
        console.error("[FAIL] Failed to fetch chunk:", error.message);
    }
}

// Test 1: Dummy chunk
async function main() {
    await testHoverAPI('dummy_123', 'Dummy Chunk');
    // Test 2: Real PDF chunks from GPU_architecture_basics.pdf
    await testHoverAPI('03jmrms8y6hnr07by0bb', 'Real PDF Chunk (page 4)');
    await testHoverAPI('9qqq4hd6zjqonjjue49n', 'Real PDF Chunk (page ?)');
}
main();

