from typing_extensions import override
from comfy_api.latest import ComfyExtension
from .py import join_prompt

class Extension(ComfyExtension):
    @override
    async def get_node_list(self):
        return [
            join_prompt.JoinPrompt
        ]

async def comfy_entrypoint():
    return Extension()

WEB_DIRECTORY = "./web"