from .py.utils import mk_name, set_default_category
from .py import join_prompt

NODE_CLASS_MAPPINGS = {
    mk_name("JoinPrompt"): join_prompt.JoinPrompt, 
}

NODE_DISPLAY_NAME_MAPPINGS = {
    mk_name("JoinPrompt"): "Join Prompt"
}

WEB_DIRECTORY = "./web"

set_default_category(NODE_CLASS_MAPPINGS)