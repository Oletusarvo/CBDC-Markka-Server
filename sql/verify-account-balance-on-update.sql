-- Verifies an account balance stays correct relative to executed transactions.
-- This is meant to be used only when not using tokens for transactions.

CREATE OR REPLACE FUNCTION verify_account_balance_on_update()
RETURNS TRIGGER AS $$
	DECLARE 
	total_transacted BIGINT;
	
	BEGIN 
		IF NEW.id <> OLD.id THEN 
			RAISE 'The id of an account cannot be changed!';
		END IF;
		
		SELECT SUM(amount_in_cents) FROM "transaction" WHERE "from" = OLD.id OR "to" = OLD.id INTO total_transacted;
		
		IF total_transacted <> NEW.balance_in_cents THEN 
			RAISE 'Account balance does not correlate with amount transacted!';
		END IF;
		
		RETURN NEW;
	END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER verify_account_balance_on_update 
BEFORE UPDATE ON account 
FOR EACH ROW 
EXECUTE FUNCTION verify_account_balance_on_update();