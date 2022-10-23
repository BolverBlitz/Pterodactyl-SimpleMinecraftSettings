const node = require('jspteroapi');
const client = new node.Client(process.env.PANEL_URL, process.env.PANEL_CLIENT_TOKEN); // for Client API
const Joi = require('joi');
const HyperExpress = require('hyper-express');
const router = new HyperExpress.Router();
const { log } = require('@lib/logger');
const { bytesToSize } = require('@lib/utils');

const properties_allowed = {
    onlineMode: "online-mode",
    enableCommandBlock: "enable-command-block",
    pvp: "pvp",
    allowFly: "allow-flight",
}

const CheckValue = Joi.object({
    bool_val: Joi.boolean().required()
});


router.get('/servers', async (req, res) => {
    const servers = await client.getAllServers();
    const servers_out = servers.filter(server => server.attributes?.egg_features !== null && (server.attributes?.egg_features?.includes('eula') || false));
    let Response = [];
    for (let i = 0; i < servers_out.length; i++) {
        Response.push({
            id: servers_out[i].attributes.identifier,
            Name: servers_out[i].attributes.name,
            Node: servers_out[i].attributes.node,
            Cpu: Number(servers_out[i].attributes.limits.cpu) / 100,
            Ram: bytesToSize(servers_out[i].attributes.limits.memory * 1024 * 1024),
            Disk: bytesToSize(servers_out[i].attributes.limits.disk * 1024 * 1024),
            Operations: `<button title="Settings" onclick="Server_Settings('${servers_out[i].attributes.identifier}')">💾</button>`
        })
    }
    res.json(Response);
});

router.get('/server/:id/config', async (req, res) => {
    try {
        const conf_file = await client.getFileContents(req.params.id, `server.properties`);
        const properties = {
            onlineMode: false,
            enableCommandBlock: false,
            pvp: false,
            allowFly: false,
        }

        const conf_file_array = conf_file.split("\n")

        conf_file_array.forEach((line) => {
            if (line.startsWith("online-mode")) { line.split("=")[1] === "true" ? properties.onlineMode = true : properties.onlineMode = false }
            if (line.startsWith("enable-command-block")) { line.split("=")[1] === "true" ? properties.enableCommandBlock = true : properties.enableCommandBlock = false }
            if (line.startsWith("pvp")) { line.split("=")[1] === "true" ? properties.pvp = true : properties.pvp = false }
            if (line.startsWith("allow-flight")) { line.split("=")[1] === "true" ? properties.allowFly = true : properties.allowFly = false }
        });
        res.json(properties);
    } catch (error) {
        log.error(error.ERRORS || error);
        throw Error("JSPteroAPIError");
    }
});

router.post('/server/:id/set/:option', async (req, res) => {
    const value = await CheckValue.validateAsync(await req.json());
    try {
        const conf_file = await client.getFileContents(req.params.id, `server.properties`);
        let conf_file_array = conf_file.split("\n")

        const option = properties_allowed[req.params.option];

        if (option !== undefined) {
            for (let i = 0; i < conf_file_array.length; i++) {
                if (conf_file_array[i].startsWith(option)) {
                    conf_file_array[i] = `${option}=${value.bool_val}`
                }
            }

            client.writeFile(req.params.id, `server.properties`, conf_file_array.join("\n")).then(() => {
                res.json({ success: true });
            })
        } else {
            throw new Error("InvalidOption");
        }
    } catch (error) {
        log.error(error.ERRORS || error);
        throw Error("JSPteroAPIError");
    }
});


module.exports = router;