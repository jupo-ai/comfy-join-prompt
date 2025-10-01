from functools import wraps
from server import PromptServer
from typing import Union, Literal
from comfy.comfy_types import IO
import sys

author = "jupo"
packageName = "JoinPrompt"
category = f"{author}/{packageName}"


# ===============================================
# ユーティリティ
# ===============================================
def mk_name(name: str):
    return f"{author}.{packageName}.{name}"
        


# ===============================================
# エンドポイント用
# ===============================================
class Endpoint:
    routes = PromptServer.instance.routes
    
    @classmethod
    def _endpoint(cls, part: str):
        return f"/{author}/{packageName}/{part}"
    
    @classmethod
    def get(cls, path: str):
        """GETリクエスト用のデコレータ"""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                return func(*args, **kwargs)
            
            cls.routes.get(cls._endpoint(path))(wrapper)
            return wrapper
        return decorator
    
    @classmethod
    def post(cls, path: str):
        """POSTリクエスト用のデコレータ"""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                return func(*args, **kwargs)
            
            cls.routes.post(cls._endpoint(path))(wrapper)
            return wrapper
        return decorator




