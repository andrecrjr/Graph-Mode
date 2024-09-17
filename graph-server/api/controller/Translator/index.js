import BlockNoteToNotionConverter from "./BlockNoteTranslate.js";

class TranslateController {
    constructor(){
        this.blockNoteToNotion = new BlockNoteToNotionConverter()
    }
    async postHandler(req){
        try {            
            const bodyData = req.body
            const notionData = this.blockNoteToNotion.convert(bodyData.children)
            const data = await req.notionAPI.createPage(bodyData.parentId, bodyData.title, notionData)
            return data;
        } catch (error) {
            throw new Error(`Problem to create a new page ${error}`)
        }
    }
}

export default TranslateController