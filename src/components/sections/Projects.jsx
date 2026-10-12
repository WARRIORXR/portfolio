import { useMemo } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Github } from '../ui/BrandIcons'
import { ProjectShowcase } from '../ui/project-showcase'
import { useGithubRepos } from '../../hooks/useGithubRepos'
import { SectionWrapper, SectionItem, SectionTitle } from '../shared/SectionWrapper'
import { personalInfo } from '../../data/personalInfo'

// Raw GitHub API repo → showcase item. OG card endpoint renders a branded
// preview for any public repo, so no stock photos are needed.
function toShowcaseItem(repo) {
  const slug = repo.html_url.replace('https://github.com/', '')
  return {
    title: repo.name,
    description: repo.description || 'No description provided.',
    year: String(new Date(repo.updated_at).getFullYear()),
    link: repo.html_url,
    image: `https://opengraph.githubassets.com/1/${slug}`,
  }
}

function SkeletonList() {
  return (
    <div className="flex flex-col" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="py-5 border-t border-white/[0.08]">
          <div className="h-4 w-32 bg-white/[0.06] rounded animate-pulse" />
          <div className="mt-2 h-3 w-64 bg-white/[0.04] rounded animate-pulse" />
        </div>
      ))}
      <div className="border-t border-white/[0.08]" />
    </div>
  )
}

export default function Projects() {
  const { repos, loading } = useGithubRepos()

  const items = useMemo(() => repos.slice(0, 6).map(toShowcaseItem), [repos])

  return (
    <SectionWrapper id="projects">
      <SectionTitle
        index="03"
        label="Selected Work"
        title="Things I've built."
        subtitle="Live from GitHub — hover a row for a preview, click to open the repository."
      />

      <SectionItem>
        {loading ? (
          <SkeletonList />
        ) : (
          <ProjectShowcase projects={items} title="Repositories" />
        )}
      </SectionItem>

      <SectionItem>
        <a
          href={personalInfo.github}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-8 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
        >
          <Github className="w-4 h-4" />
          View all repositories
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </SectionItem>
    </SectionWrapper>
  )
}
