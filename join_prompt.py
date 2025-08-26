from comfy.comfy_types import IO
from .utils import Field

class JoinPrompt:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "optional": {
                "prev_text": Field.string(forceInput=True), 
            }, 
            "required": {
                "text": Field.string(multiline=True), 
            }
        }
    
    RETURN_TYPES = (IO.STRING, )
    FUNCTION = "execute"
    
    def execute(self, text: str, prev_text: str=""):
        joined = "".join([prev_text, text])
        
        return (joined, )



