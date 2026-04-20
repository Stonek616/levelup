CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),                                                                                                                                                
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,                                                                                                                                                           
      password_hash VARCHAR(255) NOT NULL,
      bio TEXT,
      avatar_url VARCHAR(500),                                                                                                                                                                      
      onboarding_completed BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT now(),                                                                                                                                                  
      updated_at TIMESTAMP NOT NULL DEFAULT now()
  );      

  CREATE TABLE refresh_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),                                                                                                                                                
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(500) UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,                                                                                                                                                                
      revoked BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT now()                                                                                                                                                   
  );              

  CREATE TABLE password_reset_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,                                                                                                                                 
      token VARCHAR(500) UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,                                                                                                                                                                
      used BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT now()
  ); 