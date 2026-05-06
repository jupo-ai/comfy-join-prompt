from comfy_api.latest import io
from ...utils import mk_name
from .common import PACKAGE_NAME, CATEGORY
from .join_strings import JoinStrings

import json

class JoinPrompt(io.ComfyNode):
    @classmethod
    def define_schema(cls):
        return io.Schema(
            node_id=mk_name(PACKAGE_NAME, "JoinPrompt"), 
            display_name="Join Prompt", 
            category=CATEGORY, 
            inputs=[
                io.String.Input("prev", optional=True, force_input=True), 
                io.String.Input("text", multiline=True), 
                io.String.Input("options", extra_dict={"hidden": True}, default="", optional=True), 
            ], 
            outputs=[
                io.String.Output(), 
            ]
        )
    
    @classmethod
    def execute(cls, text: str, prev: str="", options: str=""):
        to_join = []
        if prev: to_join.append(prev)
        if text: to_join.append(text)

        try:
            options_dict = json.loads(options)
        except:
            options_dict = {}
        delimiter = options_dict.get("delimiter", "")
        cleanup = options_dict.get("cleanup", False)

        output = JoinStrings().join_strings(to_join, delimiter, cleanup)
        
        return io.NodeOutput(output)
