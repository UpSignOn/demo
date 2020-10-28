array='["firstname","lastname","title","dateOfBirth","email","phoneNumber","postalAddress","iban","newsletterConsent"]';

psql upsignon <<EOF
  \x
  UPDATE partners SET requested_props='$array' WHERE id='monptitshop.upsignon.eu';
  UPDATE partners SET requested_props='$array' WHERE id='monptitshop.upsignon.eu prod';
  UPDATE partners SET requested_props='$array' WHERE id='raoul.upsignon.eu';
  UPDATE partners SET requested_props='$array' WHERE id='raoul.upsignon.eu prod';
  SELECT * FROM partners WHERE id='monptitshop.upsignon.eu';
  SELECT * FROM partners WHERE id='monptitshop.upsignon.eu prod';
  SELECT * FROM partners WHERE id='raoul.upsignon.eu';
  SELECT * FROM partners WHERE id='raoul.upsignon.eu prod';
EOF

ssh upsignon@upsignon.eu "psql UpSignOn <<EOF
  \x
  UPDATE partners SET requested_props='$array' WHERE id='monptitshop.upsignon.eu';
  UPDATE partners SET requested_props='$array' WHERE id='raoul.upsignon.eu';
  SELECT * FROM partners WHERE id='monptitshop.upsignon.eu';
  SELECT * FROM partners WHERE id='raoul.upsignon.eu';
EOF"
