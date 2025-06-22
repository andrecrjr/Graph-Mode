

// convert 2917253f16594026917142f065f7703e to 2917253f-1659-4026-9171-42f065f7703e

export function convertToUid(block) {
    return block.replace(/-/g, '').slice(0, 8) + '-' + block.replace(/-/g, '').slice(8, 12) + '-' + block.replace(/-/g, '').slice(12, 16) + '-' + block.replace(/-/g, '').slice(16, 20) + '-' + block.replace(/-/g, '').slice(20, 32);
}