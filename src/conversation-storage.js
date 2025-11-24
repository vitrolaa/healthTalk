

export function downloadConversationAsJSON(messages) {
    const conversation = {
        id: `conv_${Date.now()}`,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleString('pt-BR'),
        totalMessages: messages.length,
        messages: messages
    };

    const jsonString = JSON.stringify(conversation, null, 2);

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const dateStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    link.download = `healthtalk_conversa_${dateStr}_${timeStr}.json`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

