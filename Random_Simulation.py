import random

def monty_hall_simulation(num_trials):

    switch_wins = 0
    stay_wins = 0
    new_wins = 0

    previous_precentage = 0

    for i in range(num_trials):
        doors = ['goat', 'goat', 'car']
        random.shuffle(doors)

        current_percentage = (i / num_trials) * 100
        if current_percentage - previous_precentage >= 0.1:
            print(f"{current_percentage:.2f}%")
            previous_precentage = current_percentage

        initial_choice = random.randint(0, 2)

        host_opens = next(i for i in range(3) if i != initial_choice and doors[i] == 'goat')

        switch_choice = next(i for i in range(3) if i != initial_choice and i != host_opens)
        new_choice = random.randint(0, 2)
        while new_choice == host_opens:
            new_choice = random.randint(0, 2)

        if doors[switch_choice] == 'car':
            switch_wins += 1
        if doors[initial_choice] == 'car':
            stay_wins += 1
        if doors[new_choice] == 'car':
            new_wins += 1

    return switch_wins, stay_wins,new_wins


def coin_flip_simulation(num_trials):
    heads_count = 0
    tails_count = 0

    previous_precentage = 0
    

    for i in range(num_trials):

        current_percentage = (i / num_trials) * 100
        if current_percentage - previous_precentage >= 0.1:
            print(f"{current_percentage:.2f}%")
            previous_precentage = current_percentage

        flip_result = random.choice(['heads', 'tails'])
        if flip_result == 'heads':
            heads_count += 1
        else:
            tails_count += 1

    return heads_count, tails_count


print("Monty Hall Simulation")
print("===================================")
num_trials = int(input("Enter the number of trials: "))
switch_wins, stay_wins,new_wins = monty_hall_simulation(num_trials)
print(f"Switching wins: {switch_wins} out of {num_trials} trials Chance: {switch_wins/num_trials:.4%}")
print(f"Staying wins: {stay_wins} out of {num_trials} trials Chance: {stay_wins/num_trials:.4%}")
print(f"Staying wins: {new_wins} out of {num_trials} trials Chance: {new_wins/num_trials:.4%}")

print("===================================")
print("Simulation complete.")       
print("===================================")
print("Coin Flip Simulation")
print("===================================")
num_trials = int(input("Enter the number of trials: "))

heads,tails = coin_flip_simulation(num_trials)

print(f"heads wins: {heads} out of {num_trials} trials Chance: {heads/num_trials:.4%}")
print(f"tails wins: {tails} out of {num_trials} trials Chance: {tails/num_trials:.4%}")

print("===================================")
print("Simulation complete.")       