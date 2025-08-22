from .utils import _name, _dname
from .join_prompt import JoinPrompt

NODE_CLASS_MAPPINGS = {
    _name("JoinPrompt"): JoinPrompt, 
}

NODE_DISPLAY_NAME_MAPPINGS = {k: _dname(k) for k in NODE_CLASS_MAPPINGS}
WEB_DIRECTORY = "./web"
