import {useEffect, useState} from 'react';
import {useFetchClient} from '@strapi/helper-plugin'
import {
  Alert,
  Box,
  Checkbox,
  Flex,
  IconButton,
  Link,
  Loader,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Typography
} from '@strapi/design-system';
import {Pencil, Plus, Trash} from '@strapi/icons';
import ConfirmationDialog from "./ConfirmationDialog";
import BulkActions from "./BulkActions";
import {useIntl} from 'react-intl';
import getTrad from "../utils/getTrad";

type AlertType = {
  title: string;
  message: string;
  variant: 'success' | 'danger';
} | undefined;

const Repo = () => {
  const COL_COUNT = 5;

  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [alert, setAlert] = useState<AlertType>(undefined);
  const [deletingRepo, setDeletingRepo] = useState(undefined);
  const {formatMessage} = useIntl();

  const client = useFetchClient();

  const allChecked = selectedRepos.length === repos.length;
  const isIndeterminate = selectedRepos.length > 0 && !allChecked;

  const showAlert = (alert) => {
    setAlert(alert);
    setTimeout(() => setAlert(undefined), 5000);
  }

  const createProject = (repo) => {
    client.post('/github-projects/project', repo)
      .then(response => {
        setRepos(repos.map((item) =>
          item.id !== repo.id ? item : {...item, repositoryId: response.data.id}
        ));

        showAlert({
          title: "Project created",
          message: `Successfully created project for ${response.data.title}`,
          variant: 'success'
        });
      })
      .catch(error => {
        showAlert({
          title: "An error occurred",
          message: error.toString(),
          variant: 'danger'
        });
      })
  }

  const deleteProject = (repo) => {
    const {repositoryId} = repo;

    client.del(`/github-projects/project/${repositoryId}`)
      .then(response => {
        setRepos(repos.map((item) =>
          item.repositoryId !== repositoryId ? item : {...item, repositoryId: null}
        ));

        showAlert({
          title: "Project deleted",
          message: `Successfully deleted project ${response.data.title}`,
          variant: 'success'
        });
      })
      .catch(error => {
        showAlert({
          title: "An error occurred",
          message: error.toString(),
          variant: 'danger'
        });
      });
  }

  const createAll = (reposToBeCreated) => {
    client.post('/github-projects/projects', {repos: reposToBeCreated})
      .then(response => {
        if (response.data.length === reposToBeCreated.length) {
          setRepos(repos.map((repo) => {
              const relatedProjectJustCreated = response.data.find((project) => project.repositoryId == repo.id);

              return !repo.repositoryId && relatedProjectJustCreated ? {
                ...repo,
                repositoryId: relatedProjectJustCreated.id
              } : repo;
            }
          ));

          showAlert({
            title: "Projects created",
            message: `Successfully created projects for ${repos.length} repositories`,
            variant: 'success'
          });
        }
      })
      .catch(error => {
        showAlert({
          title: "An error occurred",
          message: error.toString(),
          variant: 'danger'
        });
      })
      .finally(() => setSelectedRepos([]));
  }

  const deleteAll = (repositoryIds) => {
    client.del('/github-projects/projects', {
      params: {
        repositoryIds
      }
    })
      .then(response => {
        if (response.data.length === repositoryIds.length) {
          setRepos(repos.map((repo) =>
            ({...repo, repositoryId: null})
          ));

          showAlert({
            title: "Projects deleted",
            message: `Successfully deleted projects for ${repositoryIds.length} repositories`,
            variant: 'success'
          });
        }
      })
      .catch(error => {
        showAlert({
          title: "An error occurred",
          message: error.toString(),
          variant: 'danger'
        });
      })
      .finally(() => setSelectedRepos([]));
  }

  useEffect(() => {
    setLoading(this);

    client.get('/github-projects/repos')
      .then(response => {
        setRepos(response.data);
      })
      .catch(error => {
        showAlert({
          title: "Error fetching repositories",
          message: error.toString(),
          variant: 'danger'
        })
      });

    setLoading(false);
  }, []);

  if (loading) {
    return <Loader/>
  }

  return (
    <Box padding={8} background="neutral100">
      {alert && (
        <div style={{position: "absolute", top: 0, left: '14%', zIndex: 10}}>
          <Alert
            closeLabel="Close alert"
            title={alert.title}
            variant={alert.variant}
          >
            {alert.message}
          </Alert>
        </div>
      )}
      {selectedRepos.length > 0 && (
        <BulkActions
          selectedRepos={selectedRepos.map((repoId) => repos.find(({id}) => id === repoId))}
          bulkCreateAction={createAll}
          bulkDeleteAction={deleteAll}
        />
      )}
      <Table colCount={COL_COUNT} rowCount={repos.length}>
        <Thead>
          <Tr>
            <Th>
              <Checkbox
                aria-label="Select all entries"
                indeterminate={isIndeterminate}
                value={allChecked}
                onValueChange={value => value ? setSelectedRepos(repos.map((repo) => repo.id)) : setSelectedRepos([])}
              />
            </Th>
            <Th>
              <Typography variant="sigma">
                {
                  formatMessage(
                    {
                      id: getTrad('repo.name'),
                      defaultMessage: 'Name'
                    }
                  )
                }
              </Typography>
            </Th>
            <Th>
              <Typography variant="sigma">
                {
                  formatMessage(
                    {
                      id: getTrad('repo.description'),
                      defaultMessage: 'Description'
                    }
                  )
                }
              </Typography>
            </Th>
            <Th>
              <Typography variant="sigma">
                {
                  formatMessage(
                    {
                      id: getTrad('repo.url'),
                      defaultMessage: 'Url'
                    }
                  )
                }
              </Typography>
            </Th>
            <Th>
              <Typography>
                {
                  formatMessage(
                    {
                      id: getTrad('repo.actions'),
                      defaultMessage: 'Actions'
                    }
                  )
                }
              </Typography>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {
            repos.map(repo => {
              const {id, repositoryId, name, shortDescription, url} = repo;

              return (
                <Tr key={id}>
                  <Td>
                    <Checkbox
                      aria-label={`Select ${id}`}
                      value={selectedRepos.includes(id)}
                      onValueChange={(value) => {
                        const newSelectedRepos = value ? [...selectedRepos, id] : selectedRepos.filter((selectedId) => selectedId !== id);
                        setSelectedRepos(newSelectedRepos);
                      }}
                    />
                  </Td>
                  <Td>
                    <Typography textColor="neutral800">{name}</Typography>
                  </Td>
                  <Td>
                    <Typography textColor="neutral800">{shortDescription}</Typography>
                  </Td>
                  <Td>
                    <Typography textColor="neutral800">
                      <Link href={url} isExternal={url}>
                        {url}
                      </Link>
                    </Typography>
                  </Td>
                  <Td>
                    {repositoryId ?
                      (
                        <Flex>
                          <Link to={`/content-manager/collectionType/plugin::github-projects.project/${repositoryId}`}>
                            <IconButton label="Edit" borderWidth={0}>
                              <Pencil/>
                            </IconButton>
                          </Link>
                          <Box paddingLeft={1}>
                            <IconButton onClick={() => setDeletingRepo(repo)} label="Delete" borderWidth={0}>
                              <Trash/>
                            </IconButton>
                          </Box>
                        </Flex>
                      ) : (
                        <IconButton onClick={() => createProject(repo)} label="Add" borderWidth={0}>
                          <Plus/>
                        </IconButton>
                      )
                    }
                  </Td>
                </Tr>
              )
            })
          }
        </Tbody>
      </Table>
      {deletingRepo && (
        <ConfirmationDialog
          visible={!!deletingRepo}
          message="Are you sure you want to delete this project?"
          onClose={() => setDeletingRepo(undefined)}
          onConfirm={() => deleteProject(deletingRepo)}
        />
      )}
    </Box>
  )
}

export default Repo
