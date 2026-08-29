import ast, hashlib, sys
tree = ast.parse(open(sys.argv[1], encoding="utf-8").read(), mode="exec")
actual = hashlib.sha256(ast.dump(tree, annotate_fields=True, include_attributes=False).encode("utf-8")).hexdigest()
if actual != "2268bc18803173dbf175e1eaab901eaad5547baed75ab33321e104e43f073a01": raise SystemExit("ROUTING_AST=FAIL")
print("ROUTING_AST=PASS")
