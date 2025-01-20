import { InMemoryWebinarRepository } from '../adapters/webinar-repository.in-memory';
import { InMemoryParticipationRepository } from '../adapters/participation-repository.in-memory';
import { InMemoryMailer } from 'src/core/adapters/in-memory-mailer';
import { InMemoryUserRepository } from 'src/users/adapters/user-repository.in-memory';
import { BookSeat } from './book-seat';
import { Webinar } from '../entities/webinar.entity';
import { User } from 'src/users/entities/user.entity';

describe('Feature: Book seat in webinar', () => {
  let webinarRepository: InMemoryWebinarRepository;
  let participationRepository: InMemoryParticipationRepository;
  let mailer: InMemoryMailer;
  let userRepository: InMemoryUserRepository;
  let useCase: BookSeat;

  beforeEach(() => {
    webinarRepository = new InMemoryWebinarRepository();
    participationRepository = new InMemoryParticipationRepository();
    mailer = new InMemoryMailer();
    userRepository = new InMemoryUserRepository();
    useCase = new BookSeat(webinarRepository, participationRepository, userRepository, mailer);
  });

  // Test 1 : Cas général de réservation
  it('should book a seat successfully', async () => {
    // Créer un webinaire
    const webinar = new Webinar({
      id: 'webinar-1',
      organizerId: 'organizer-1',
      title: 'Test Webinar',
      startDate: new Date(),
      endDate: new Date(),
      seats: 10,
    });
    await webinarRepository.create(webinar);

    // Créer et sauvegarder un utilisateur
    const user = new User({
      id: 'user-1',
      email: 'user@test.com',
      password: 'password',
    });
    await userRepository.save(user);

    // Réserver une place
    await useCase.execute({ webinarId: 'webinar-1', user });

    // Vérifications
    const participations = await participationRepository.findByWebinarId('webinar-1');
    expect(participations).toHaveLength(1);

    expect(mailer.sentEmails).toHaveLength(1);
    expect(mailer.sentEmails[0]).toEqual({
      to: 'organizer-1',
      subject: 'New participant registered',
      body: `${user.props.email} has registered for your webinar "Test Webinar".`,
    });
  });

  // Test 2 : Vérification des comportements du référentiel utilisateur
  it('should manage users correctly in InMemoryUserRepository', async () => {
    // Sauvegarder un utilisateur
    const user = new User({
      id: 'user-1',
      email: 'test-user@test.com',
      password: 'password123',
    });
    await userRepository.save(user);

    // Vérifier que l'utilisateur est enregistré
    const foundUser = await userRepository.findById('user-1');
    expect(foundUser).toEqual(user);

    // Mettre à jour l'utilisateur
    const updatedUser = new User({
      id: 'user-1',
      email: 'updated-user@test.com',
      password: 'new-password',
    });
    await userRepository.save(updatedUser);

    // Vérifier la mise à jour
    const foundUpdatedUser = await userRepository.findById('user-1');
    expect(foundUpdatedUser?.props.email).toBe('updated-user@test.com');
    expect(foundUpdatedUser?.props.password).toBe('new-password');

    // Supprimer l'utilisateur
    await userRepository.delete('user-1');

    // Vérifier que l'utilisateur a été supprimé
    const deletedUser = await userRepository.findById('user-1');
    expect(deletedUser).toBeNull();
  });

  // Test 3 : Réservation échoue si pas de sièges disponibles
  it('should throw an error if no seats are available', async () => {
    const webinar = new Webinar({
      id: 'webinar-1',
      organizerId: 'organizer-1',
      title: 'Test Webinar',
      startDate: new Date(),
      endDate: new Date(),
      seats: 0, // Aucun siège disponible
    });
    await webinarRepository.create(webinar);

    const user = new User({
      id: 'user-1',
      email: 'user@test.com',
      password: 'password',
    });
    await userRepository.save(user);

    await expect(useCase.execute({ webinarId: 'webinar-1', user })).rejects.toThrow('No seats available for this webinar');
  });

  // Test 4 : Réservation échoue si utilisateur déjà inscrit
  it('should throw an error if user is already registered', async () => {
    const webinar = new Webinar({
      id: 'webinar-1',
      organizerId: 'organizer-1',
      title: 'Test Webinar',
      startDate: new Date(),
      endDate: new Date(),
      seats: 10,
    });
    await webinarRepository.create(webinar);

    const user = new User({
      id: 'user-1',
      email: 'user@test.com',
      password: 'password',
    });
    await userRepository.save(user);

    // Inscrire l'utilisateur une première fois
    const participation = new Webinar({
      userId: user.props.id,
      webinarId: 'webinar-1',
    });
    await participationRepository.save(participation);

    // Essayer de l'inscrire à nouveau
    await expect(useCase.execute({ webinarId: 'webinar-1', user })).rejects.toThrow('User is already registered for this webinar');
  });

  // Test 5 : Réservation échoue si le webinaire n'existe pas
  it('should throw an error if webinar does not exist', async () => {
    const user = new User({
      id: 'user-1',
      email: 'user@test.com',
      password: 'password',
    });
    await userRepository.save(user);

    await expect(useCase.execute({ webinarId: 'non-existent-webinar', user })).rejects.toThrow('Webinar not found');
  });
});
