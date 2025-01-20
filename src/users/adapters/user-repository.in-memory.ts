import { IUserRepository } from '../ports/user-repository.interface';
import { User } from '../entities/user.entity';

export class InMemoryUserRepository implements IUserRepository {
  private database: User[] = [];

  /**
   * Recherche un utilisateur par son ID.
   * @param id L'ID de l'utilisateur.
   * @returns L'utilisateur correspondant ou null si non trouvé.
   */
  async findById(id: string): Promise<User | null> {
    return this.database.find(user => user.props.id === id) || null;
  }

  /**
   * Sauvegarde un utilisateur dans la base en mémoire.
   * Si l'utilisateur existe déjà, il sera mis à jour.
   * @param user L'utilisateur à sauvegarder.
   */
  async save(user: User): Promise<void> {
    const existingUser = await this.findById(user.props.id);
    if (existingUser) {
      // Mise à jour de l'utilisateur existant
      Object.assign(existingUser.props, user.props);
    } else {
      // Ajout d'un nouvel utilisateur
      this.database.push(user);
    }
  }

  /**
   * Supprime un utilisateur de la base en mémoire par son ID.
   * @param id L'ID de l'utilisateur à supprimer.
   */
  async delete(id: string): Promise<void> {
    this.database = this.database.filter(user => user.props.id !== id);
  }

  /**
   * Retourne tous les utilisateurs stockés dans la base en mémoire.
   * @returns Une liste de tous les utilisateurs.
   */
  async findAll(): Promise<User[]> {
    return this.database;
  }
}
