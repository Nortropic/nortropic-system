import ast, hashlib, sys
tree = ast.parse(open(sys.argv[1], encoding="utf-8").read(), mode="exec")
actual = hashlib.sha256(ast.dump(tree, annotate_fields=True, include_attributes=False).encode("utf-8")).hexdigest()
if actual != "14e80cc9fbcecf36ae339a18adcbb534f4b03e431e56ec1876538df1cb5ca45b": raise SystemExit("ROUTING_AST=FAIL")
print("ROUTING_AST=PASS")
