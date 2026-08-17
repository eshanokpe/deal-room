# Deal Room

Deal Room allows founders to upload fundraising documents, generate secure investor share links, and track when those documents are opened.

 
Demo user created:
Email: demo@dealroom.test
Password: Demo123!

# 1. Kill any background Node processes holding onto old env vars
killall node

# 2. Delete the Next.js cache folder
rm -rf .next

# 3. Start the server fresh
npm run dev

npx prisma db push

npm run db:seed