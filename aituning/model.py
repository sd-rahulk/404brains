from llama_cpp import Llama
llm = Llama(model_path="models/unsloth.Q8_0.gguf")
print(llm("Write a short explanation of insider threat detection.", max_tokens=80))
