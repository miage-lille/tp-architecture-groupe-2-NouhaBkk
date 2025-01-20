import { IMailer } from 'src/core/ports/mailer.interface';
import { Executable } from 'src/shared/executable';
import { User } from 'src/users/entities/user.entity';
import { IUserRepository } from 'src/users/ports/user-repository.interface';
import { IParticipationRepository } from 'src/webinars/ports/participation-repository.interface';
import { IWebinarRepository } from 'src/webinars/ports/webinar-repository.interface';
import { Participation } from 'src/webinars/entities/participation.entity';
type Request = {
  webinarId: string;
  user: User;
};
type Response = void;

export class BookSeat implements Executable<Request, Response> {
  constructor(
    private readonly webinarRepository: IWebinarRepository,
    private readonly participationRepository: IParticipationRepository,
    private readonly userRepository: IUserRepository, 
    private readonly mailer: IMailer
  ) {}
  async execute({ webinarId, user }: Request): Promise<Response> {
    const webinar = await this.webinarRepository.findById(webinarId);
    if (!webinar) {
      throw new Error('Webinar not found');
    }

    const participations = await this.participationRepository.findByWebinarId(webinarId);

    // Vérification 1 : Places disponibles
    if (participations.length >= webinar.props.seats) {
      throw new Error('No seats available for this webinar');
    }

    // Vérification 2 : L'utilisateur est déjà inscrit
    if (participations.some(p => p.props.userId === user.props.id)) {
      throw new Error('User is already registered for this webinar');
    }

    const participation = new Participation({ userId: user.props.id, webinarId });
    await this.participationRepository.save(participation);

    await this.mailer.send({
      to: webinar.props.organizerId,
      subject: 'New participant registered',
      body: `${user.props.email} has registered for your webinar "${webinar.props.title}".`,
    });
  }
}
