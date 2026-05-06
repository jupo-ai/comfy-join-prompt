from comfy_api.latest import io
from ...utils import mk_name
from .common import PACKAGE_NAME, CATEGORY


class JoinStrings(io.ComfyNode):
    ESCAPED_DELIMITERS = {
        r"\n": "\n",
        r"\r": "\r",
        r"\t": "\t",
    }

    @classmethod
    def define_schema(cls):
        template = io.Autogrow.TemplatePrefix(
            io.String.Input("text"), 
            prefix="text_", 
            min=1, 
            max=50, 
        )
        
        return io.Schema(
            node_id=mk_name(PACKAGE_NAME, "JoinStrings"), 
            display_name="Join Strings", 
            category=CATEGORY, 
            inputs=[
                io.Autogrow.Input("texts", template=template), 
                io.String.Input("delimiter", default="", advanced=True), 
                io.Boolean.Input("cleanup", default=False, advanced=True), 
            ], 
            outputs=[
                io.String.Output(), 
            ]
        )
    
    @classmethod
    def execute(cls, texts: io.Autogrow.Type, delimiter: str="", cleanup: bool=False):
        to_join = texts.values()
        output = cls.join_strings(to_join, delimiter, cleanup)
        
        return io.NodeOutput(output)

    @classmethod
    def parse_delimiter(cls, delimiter: str):
        for escaped, value in cls.ESCAPED_DELIMITERS.items():
            delimiter = delimiter.replace(escaped, value)
        return delimiter
    
    @classmethod
    def cleanup_by_comma(cls, text: str):
        lines = text.split("\n")
        to_join = []
        for line in lines:
            cleaned_tags = []
            tags = line.split(",")
            for tag in tags:
                cleaned_tags.append(tag.strip())
            cleaned_line = ", ".join(cleaned_tags)
            
            to_join.append(cleaned_line)
        return "\n".join(to_join)

    
    @classmethod
    def join_strings(cls, to_join: list[str], delimiter: str, cleanup: bool):
        if cleanup:
            to_join = [cls.cleanup_by_comma(text) for text in to_join]
        delimiter = cls.parse_delimiter(delimiter)
        output = delimiter.join(to_join)
        return output
