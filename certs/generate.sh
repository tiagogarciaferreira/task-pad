#!/bin/bash

# Get ExternalIPs from all nodes
mapfile -t IPS < <(kubectl get nodes -o jsonpath='{range .items[*]}{.status.addresses[?(@.type=="ExternalIP")].address}{"\n"}{end}')
echo "Convert ../certs/key.pem and ../certs/cert.pem to base64 and update the envs: TLS_CRT | TLS_KEY in .env.production"

# Error if no IPs found
if [ ${#IPS[@]} -eq 0 ]; then
    echo "ERROR: No ExternalIPs found from any node"
    exit 1
fi

# Generate openssl configuration file in ../certs/ (parent directory)
cat > ../certs/openssl.conf << EOF
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = ${IPS[0]}

[v3_req]
subjectAltName = @alt_names

[alt_names]
EOF

# Add each IP to the alt_names section - using the SAME path
for i in "${!IPS[@]}"; do
    echo "IP.$((i+1)) = ${IPS[$i]}" >> ../certs/openssl.conf
done

# Generate cert
openssl req -x509 -nodes -days 365 \
-newkey rsa:2048 \
-keyout ../certs/key.pem \
-out ../certs/cert.pem \
-config ../certs/openssl.conf

echo "✅ File generated: ../certs/openssl.cnf"
echo "📋 IPs found: ${#IPS[@]}"
echo ""
echo "🔐 Next steps:"
echo "1. Add the following IPs to Firebase console -> Authentication -> Settings -> Authorized domains:"
for i in "${!IPS[@]}"; do
    echo "   - ${IPS[$i]}"
done
echo ""
echo "2. Convert ../certs/key.pem and ../certs/cert.pem to base64 and update the envs: TLS_CRT | TLS_KEY in .env.production"
