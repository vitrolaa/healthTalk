// Utility function to download conversation as JSON file

/**
 * Download conversation as JSON file
 * @param {Array} messages - Array of message objects
 */
export function downloadConversationAsJSON(messages) {
    // Create conversation object with metadata
    const conversation = {
        id: `conv_${Date.now()}`,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleString('pt-BR'),
        totalMessages: messages.length,
        messages: messages
    };

    // Convert to JSON string with formatting
    const jsonString = JSON.stringify(conversation, null, 2);

    // Create blob
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Generate filename with date
    const dateStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    link.download = `healthtalk_conversa_${dateStr}_${timeStr}.json`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
