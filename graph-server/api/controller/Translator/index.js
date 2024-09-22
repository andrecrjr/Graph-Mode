import BlockNoteToNotionConverter from "./BlockNoteTranslate.js";
import { getTitleFromHeading, removeFirstHeading } from "./utils.js";

class BlocknoteToNotionTranslateController {
    constructor(){
        this.blockNoteToNotion = new BlockNoteToNotionConverter()
    }
    async postHandler(req){
        try {            
            const bodyData = req.body
            const notionData = this.blockNoteToNotion.convert(bodyData.children)
            const pageTitle = getTitleFromHeading(notionData);
            const dataWithoutHeading = removeFirstHeading(notionData);
            if(bodyData.debug){
                return {dataWithoutHeading, pageTitle}
            }
            const data = await req.notionAPI.createPage(bodyData.parentId, pageTitle, dataWithoutHeading)
            return data;
        } catch (error) {
            throw new Error(`Problem to create a new page ${error}`)
        }
    }
}

export default BlocknoteToNotionTranslateController