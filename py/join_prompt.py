from comfy_api.latest import io
from .utils import mk_name, category
import json

class JoinPrompt(io.ComfyNode):
    @classmethod
    def define_schema(cls):
        return io.Schema(
            node_id=mk_name("JoinPrompt"), 
            display_name="Join Prompt", 
            category=category, 
            inputs=[
                io.String.Input("text", multiline=True), 
                io.String.Input("options", multiline=True), 
                io.String.Input("prev_text", force_input=True, optional=True)
            ], 
            outputs=[
                io.String.Output()
            ]
        )
    
    @classmethod
    def execute(cls, text: str, prev_text: str="", options: str=""):
        options = json.loads(options)

        prefix = options.get("prefix", "")
        suffix = options.get("suffix", "")
        separator = options.get("separator", "")
        join_with_newline = options.get("join_with_newline", False)
        cleanup = options.get("cleanup", False)

        text = f"{prefix}{text}{suffix}"

        if cleanup:
            text = cls.cleanup(text)
            prev_text = cls.cleanup(prev_text)
        
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


    @classmethod
    def cleanup(cls, text: str):
        last_is_commna = text.endswith(",") or text.endswith(", ")

        text_list = text.split(",")
        text_list = [t.strip() for t in text_list if t.strip()]

        res = ", ".join(text_list)
        if last_is_commna:
            res += ", "

        return res