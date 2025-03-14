const { Client, GatewayIntentBits } = require('discord.js');
const { Translate } = require('@google-cloud/translate').v2;
require('dotenv').config();

// Configuración del bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Configuración de la API de Google Translate
const translate = new Translate({
    key: process.env.GOOGLE_TRANSLATE_API_KEY
});

const targetLanguages = {
    es: 'it', // Español a Italiano
    it: 'es'  // Italiano a Español
};

client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Ignorar mensajes de bots
    
    let detectedLang;
    try {
        // Detectar el idioma del mensaje
        const [detection] = await translate.detect(message.content);
        detectedLang = detection.language;
    } catch (error) {
        console.error('Error detectando el idioma:', error);
        return;
    }

    // Si el idioma detectado no es español o italiano, ignorar
    if (!targetLanguages[detectedLang]) return;
    
    try {
        // Traducir el mensaje
        const [translation] = await translate.translate(
            message.content,
            targetLanguages[detectedLang]
        );

        // Determinar la bandera según el idioma de destino
        const flag = targetLanguages[detectedLang] === 'it' ? '🇮🇹' : '🇪🇸';
        
        // Enviar la traducción con la bandera correspondiente
        await message.reply(`${flag} ${translation}`);
    } catch (error) {
        console.error('Error traduciendo el mensaje:', error);
    }
});

client.once('ready', () => {
    console.log(`Bot conectado como ${client.user.tag}`);
});

client.login(process.env.DISCORD_BOT_TOKEN);
