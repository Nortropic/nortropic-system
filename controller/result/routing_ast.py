import ast, hashlib, sys
tree = ast.parse(open(sys.argv[1], encoding="utf-8").read(), mode="exec")
actual = hashlib.sha256(ast.dump(tree, annotate_fields=True, include_attributes=False).encode("utf-8")).hexdigest()
if actual != "24fca776d226f84acb03e1eeb4606ba65f58aa6da3eb489a5efeb5c166b9e4ff": raise SystemExit("ROUTING_AST=FAIL")
print("ROUTING_AST=PASS")
