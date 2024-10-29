// src/claude.ts
import type { Node, NodeDef } from 'node-red';
const { Anthropic } = require('@anthropic-ai/sdk');

interface ClaudeNodeConfig extends NodeDef {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
    systemPrompt: string;
}

module.exports = function(RED: any) {
    function ClaudeNode(this: Node, config: ClaudeNodeConfig) {
        RED.nodes.createNode(this, config);
        const node = this;

        // Initialisation correcte du client Anthropic
        const anthropic = new Anthropic({
            apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY
        });

        node.on('input', async function(msg: any) {
            try {
                // Validation de la clé API
                if (!anthropic.apiKey) {
                    throw new Error('API key not configured');
                }

                // Validation du message
                const content = msg.payload || '';
                if (typeof content !== 'string') {
                    throw new Error('Message payload must be a string');
                }

                // Appel à l'API
                try {
                    const response = await anthropic.messages.create({
                        model: config.model || "claude-3-opus-20240229",
                        max_tokens: config.maxTokens || 1024,
                        messages: [{
                            role: "user",
                            content: content
                        }]
                    });

                    // Traitement de la réponse
                    msg.payload = response.content[0].text;
                    msg.claude = {
                        model: response.model,
                        usage: response.usage
                    };

                    // Mise à jour du statut
                    node.status({
                        fill: "green",
                        shape: "dot",
                        text: "success"
                    });

                    node.send(msg);
                } catch (apiError: any) {
                    // Gestion des erreurs API spécifiques
                    node.status({
                        fill: "red",
                        shape: "ring",
                        text: apiError.message
                    });
                    node.error(`API Error: ${apiError.message}`, msg);
                }
            } catch (error: any) {
                // Gestion des erreurs générales
                node.status({
                    fill: "red",
                    shape: "ring",
                    text: error.message
                });
                node.error(`Error: ${error.message}`, msg);
            }
        });

        // Nettoyage lors de la fermeture du nœud
        node.on('close', function(done: () => void) {
            node.status({});
            done();
        });
    }

    RED.nodes.registerType("anthropic-ai", ClaudeNode);
}