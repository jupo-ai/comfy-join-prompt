from comfy.comfy_types import IO
from .utils import Field
import json

class JoinPrompt:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "text": Field.string(multiline=True), 
                "options": Field.string(multiline=True)
            }, 
            "optional": {
                "prev_text": Field.string(forceInput=True), 
            }, 
        }
    
    RETURN_TYPES = (IO.STRING, )
    FUNCTION = "execute"
    
    def execute(self, text: str, prev_text: str="", options: str=""):
        options = json.loads(options)

        prefix = options.get("prefix", "")
        suffix = options.get("suffix", "")
        separator = options.get("separator", "")
        join_with_newline = options.get("join_with_newline", False)
        cleanup = options.get("cleanup", False)

        text = f"{prefix}{text}{suffix}"

        if cleanup:
            text = self.cleanup(text)
            prev_text = self.cleanup(prev_text)
        
        if not prev_text:
            return (text, )

        to_join = [prev_text, text]
        if separator:
            to_join = [prev_text, separator, text]
        
        if join_with_newline:
            joined = "\n".join(to_join)
        else:
            joined = "".join(to_join)
        
        return (joined, )


    def cleanup(self, text: str):
        last_is_commna = text.endswith(",") or text.endswith(", ")

        text_list = text.split(",")
        text_list = [t.strip() for t in text_list if t.strip()]

        res = ", ".join(text_list)
        if last_is_commna:
            res += ", "

        return res